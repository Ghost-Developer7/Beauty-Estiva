import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/dashboard/screens/dashboard_shell.dart';
import '../../features/dashboard/screens/overview_screen.dart';
import '../../features/customers/screens/customers_screen.dart';
import '../../features/appointments/screens/appointments_screen.dart';
import '../../features/treatments/screens/treatments_screen.dart';
import '../../features/staff/screens/staff_screen.dart';
import '../../features/settings/screens/settings_screen.dart';

GoRouter createRouter(AuthProvider authProvider) {
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authProvider.isAuthenticated;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) return '/login';
      if (isLoggedIn && isLoginRoute) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => DashboardShell(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const OverviewScreen(),
          ),
          GoRoute(
            path: '/customers',
            builder: (context, state) => const CustomersScreen(),
          ),
          GoRoute(
            path: '/appointments',
            builder: (context, state) => const AppointmentsScreen(),
          ),
          GoRoute(
            path: '/treatments',
            builder: (context, state) => const TreatmentsScreen(),
          ),
          GoRoute(
            path: '/staff',
            builder: (context, state) => const StaffScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
    ],
  );
}
