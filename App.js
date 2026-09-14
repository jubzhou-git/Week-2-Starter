import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

const COLORS = {
  background: '#0B0E14',
  surface: '#151A24',
  border: '#2A3140',
  text: '#F2F4F7',
  muted: '#8C94A6',
  accent: '#00274C',
  accentText: '#FFFFFF',
};

const EVENTS = [
  {
    id: 'fall-career-fair',
    title: 'Fall Career Fair',
    date: 'Oct 14 · 10:00 AM',
    location: 'Michigan Union Ballroom',
    host: 'Career Center',
  },
  {
    id: 'umsi-design-jam',
    title: 'UMSI Design Jam',
    date: 'Oct 18 · 6:00 PM',
    location: 'North Quad 2435',
    host: 'UMSI Student Council',
  },
  {
    id: 'midnight-study-break',
    title: 'Midnight Study Break',
    date: 'Oct 22 · 9:00 PM',
    location: 'Shapiro Library',
    host: 'Student Life',
  },
  {
    id: 'homecoming-tailgate',
    title: 'Homecoming Tailgate',
    date: 'Oct 25 · 11:00 AM',
    location: 'Elbel Field',
    host: 'Alumni Association',
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('list');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [bringingGuest, setBringingGuest] = useState(false);
  const [rsvpedIds, setRsvpedIds] = useState([]);
  const [countdown, setCountdown] = useState(5);

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    EMAIL_REGEX.test(email.trim()) &&
    (!bringingGuest || guestName.trim().length > 0);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFirstName('');
    setLastName('');
    setEmail('');
    setGuestName('');
    setBringingGuest(false);
    setCurrentScreen('form');
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
  };

  const handleConfirmRsvp = () => {
    if (!isFormValid || !selectedEvent) {
      return;
    }
    setRsvpedIds((prev) =>
      prev.includes(selectedEvent.id) ? prev : [...prev, selectedEvent.id]
    );
    setCountdown(5);
    setCurrentScreen('confirmation');
  };

  const handleDone = () => {
    setCurrentScreen('list');
  };

  useEffect(() => {
    if (currentScreen !== 'confirmation') {
      return undefined;
    }
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setCurrentScreen('list');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [currentScreen]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {currentScreen === 'list' && (
          <EventListScreen
            events={EVENTS}
            rsvpedIds={rsvpedIds}
            onSelectEvent={handleSelectEvent}
          />
        )}
        {currentScreen === 'form' && selectedEvent && (
          <RsvpFormScreen
            selectedEvent={selectedEvent}
            firstName={firstName}
            lastName={lastName}
            email={email}
            guestName={guestName}
            bringingGuest={bringingGuest}
            isFormValid={isFormValid}
            onChangeFirstName={setFirstName}
            onChangeLastName={setLastName}
            onChangeEmail={setEmail}
            onChangeGuestName={setGuestName}
            onToggleBringingGuest={setBringingGuest}
            onBack={handleBackToList}
            onConfirm={handleConfirmRsvp}
          />
        )}
        {currentScreen === 'confirmation' && selectedEvent && (
          <ConfirmationScreen
            selectedEvent={selectedEvent}
            firstName={firstName}
            lastName={lastName}
            email={email}
            guestName={guestName}
            bringingGuest={bringingGuest}
            countdown={countdown}
            onDone={handleDone}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function EventListScreen({ events, rsvpedIds, onSelectEvent }) {
  return (
    <View style={styles.screen}>
      <View style={styles.listHeader}>
        <Text style={styles.headerTitle}>Campus Events</Text>
        <Text style={styles.headerSubtitle}>Tap an event to RSVP</Text>
      </View>
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {events.map((event) => {
          const isRsvped = rsvpedIds.includes(event.id);
          return (
            <Pressable
              key={event.id}
              onPress={() => onSelectEvent(event)}
              style={({ pressed }) => [
                styles.eventCard,
                pressed && styles.eventCardPressed,
              ]}
            >
              <View style={styles.eventCardTextBlock}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>
                  {event.date} · {event.location}
                </Text>
              </View>
              {isRsvped && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>You're going</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function RsvpFormScreen({
  selectedEvent,
  firstName,
  lastName,
  email,
  guestName,
  bringingGuest,
  isFormValid,
  onChangeFirstName,
  onChangeLastName,
  onChangeEmail,
  onChangeGuestName,
  onToggleBringingGuest,
  onBack,
  onConfirm,
}) {
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.formScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backButtonText}>← Events</Text>
        </Pressable>

        <View style={styles.summaryBlock}>
          <Text style={styles.summaryTitle}>{selectedEvent.title}</Text>
          <Text style={styles.summaryMeta}>
            {selectedEvent.date} · {selectedEvent.location}
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>First name</Text>
          <TextInput
            style={styles.textInput}
            value={firstName}
            onChangeText={onChangeFirstName}
            autoCapitalize="words"
            placeholder="Jane"
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Last name</Text>
          <TextInput
            style={styles.textInput}
            value={lastName}
            onChangeText={onChangeLastName}
            autoCapitalize="words"
            placeholder="Doe"
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="jane.doe@umich.edu"
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>I'm bringing a guest</Text>
          <Switch
            value={bringingGuest}
            onValueChange={onToggleBringingGuest}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
            thumbColor={COLORS.text}
          />
        </View>

        {bringingGuest && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Guest name</Text>
            <TextInput
              style={styles.textInput}
              value={guestName}
              onChangeText={onChangeGuestName}
              autoCapitalize="words"
              placeholder="Guest name"
              placeholderTextColor={COLORS.muted}
            />
          </View>
        )}

        <View style={styles.formSpacer} />

        <Pressable
          onPress={onConfirm}
          disabled={!isFormValid}
          style={({ pressed }) => [
            styles.confirmButton,
            !isFormValid && styles.confirmButtonDisabled,
            pressed && isFormValid && styles.confirmButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.confirmButtonText,
              !isFormValid && styles.confirmButtonTextDisabled,
            ]}
          >
            Confirm RSVP
          </Text>
        </Pressable>
        {!isFormValid && (
          <Text style={styles.helperText}>
            Enter your name and a valid email to continue.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ConfirmationScreen({
  selectedEvent,
  firstName,
  lastName,
  email,
  guestName,
  bringingGuest,
  countdown,
  onDone,
}) {
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <View style={styles.confirmationScreen}>
      <View style={styles.checkCircle}>
        <Text style={styles.checkMark}>✓</Text>
      </View>
      <Text style={styles.confirmationHeadline}>You're going!</Text>

      <View style={styles.confirmationDetailBlock}>
        <Text style={styles.confirmationEventTitle}>
          {selectedEvent.title}
        </Text>
        <Text style={styles.confirmationMeta}>
          {selectedEvent.date} · {selectedEvent.location}
        </Text>
        <Text style={styles.confirmationName}>{fullName}</Text>
        {bringingGuest && (
          <Text style={styles.confirmationGuest}>
            +1: {guestName.trim()}
          </Text>
        )}
        <Text style={styles.confirmationSentLabel}>Confirmation sent to</Text>
        <Text style={styles.confirmationEmail}>{email.trim()}</Text>
      </View>

      <Text style={styles.countdownText}>
        Returning to events in {countdown}…
      </Text>

      <Pressable
        onPress={onDone}
        style={({ pressed }) => [
          styles.doneButton,
          pressed && styles.doneButtonPressed,
        ]}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // List screen
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 4,
  },
  listScroll: {
    flex: 1,
  },
  listScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventCard: {
    minHeight: 72,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  eventCardPressed: {
    opacity: 0.6,
  },
  eventCardTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  eventMeta: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  badgePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.accent,
  },
  badgePillText: {
    fontSize: 13,
    color: COLORS.accentText,
    fontWeight: '600',
  },

  // Form screen
  formScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '500',
  },
  summaryBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryMeta: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  formSpacer: {
    flexGrow: 1,
    minHeight: 24,
  },
  confirmButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  confirmButtonPressed: {
    opacity: 0.85,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.accentText,
  },
  confirmButtonTextDisabled: {
    color: COLORS.muted,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
  },

  // Confirmation screen
  confirmationScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkMark: {
    fontSize: 28,
    color: COLORS.text,
  },
  confirmationHeadline: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmationDetailBlock: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmationEventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  confirmationMeta: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  confirmationName: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  confirmationGuest: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 4,
    textAlign: 'center',
  },
  confirmationSentLabel: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 12,
    textAlign: 'center',
  },
  confirmationEmail: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 24,
    textAlign: 'center',
  },
  doneButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonPressed: {
    opacity: 0.6,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
});