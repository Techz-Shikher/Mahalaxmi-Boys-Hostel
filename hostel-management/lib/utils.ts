// lib/utils.ts
/**
 * Format date to readable format
 */
export function formatDate(timestamp: any): string {
  try {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US');
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('en-US');
    }
    return 'N/A';
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Format date and time
 */
export function formatDateTime(timestamp: any): string {
  try {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleString('en-US');
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('en-US');
    }
    return 'N/A';
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text to specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get occupancy percentage
 */
export function getOccupancyPercentage(occupants: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.round((occupants / capacity) * 100);
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'Resolved':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
