export const selectors = {
  // Navigation
  navDashboard: '[data-nav-label="home"], [data-nav-label="dashboard"]',
  navPartners: '[data-nav-label="partners"]',
  navSchedule: '[data-nav-label="schedule"]',
  navContacts: '[data-nav-label="contacts"], [data-nav-label="my team"]',
  navVouchers: '[data-nav-label="vouchers"]',
  navCheckIn: '[data-nav-label="check-in"], [data-nav-label="daily check-in"]',
  navCrisis: '[data-nav-label="crisis support"]',
  navAnalytics: '[data-nav-label="analytics"], [data-nav-label="my roadmap"]',
  navDevMode: 'a:has-text("Dev Mode")',

  // Partner directory
  partnersSearchInput: 'input[placeholder*="Search"]',
  partnersFilterBarbers: 'button:has-text("Barbershops")',
  partnersFilterSalons: 'button:has-text("Salons")',
  partnersCard: '[data-partner-card]',
  partnersDetailLink: 'a:has-text("View details")',

  // Booking
  bookingDialog: '[data-booking-dialog]',
  bookingSubmit: 'button:has-text("Book Appointment")',
  bookingOpenFromCard: 'button:has-text("Book")',

  // Dev docs
  devDocsCard: '[data-testid="testing-resources-card"]',
}
