import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFF',
  },

  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },

  subheading: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },

  label: {
    fontSize: 17,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },

  text: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 8,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },

  button: {
    backgroundColor: '#4C6EF5',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    backgroundColor: '#E8F0FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },

  secondaryButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '500',
  },

  task: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  taskText: {
    fontSize: 16,
    color: '#1F2937',
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },

  moodButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  moodButtonSelected: {
    backgroundColor: '#C7D2FE',
  },

  moodEmoji: {
    fontSize: 24,
  },

  timer: {
    fontSize: 56,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
    marginVertical: 30,
  },

  largeMetric: {
    fontSize: 36,
    fontWeight: '600',
    color: '#1F2937',
    marginVertical: 8,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});