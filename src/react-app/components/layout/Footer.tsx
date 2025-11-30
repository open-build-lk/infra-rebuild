export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col items-center justify-between gap-2 text-sm text-gray-500 sm:flex-row">
        <div>
          &copy; {currentYear} Ministry of Transport, Highways and Urban
          Development
        </div>
        <div className="flex gap-4">
          <a
            href="/about"
            className="hover:text-gray-900 dark:hover:text-gray-100"
          >
            About
          </a>
          <a
            href="/privacy"
            className="hover:text-gray-900 dark:hover:text-gray-100"
          >
            Privacy
          </a>
          <a
            href="/contact"
            className="hover:text-gray-900 dark:hover:text-gray-100"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
