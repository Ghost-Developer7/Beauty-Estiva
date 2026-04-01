import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../bloc/auth/auth_cubit.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/dashboard/screens/dashboard_shell.dart';
import '../../features/dashboard/screens/overview_screen.dart';
import '../../features/dashboard/bloc/dashboard_cubit.dart';
import '../../features/customers/screens/customers_screen.dart';
import '../../features/customers/bloc/customers_cubit.dart';
import '../../features/appointments/screens/appointments_screen.dart';
import '../../features/appointments/bloc/appointments_cubit.dart';
import '../../features/treatments/screens/treatments_screen.dart';
import '../../features/treatments/bloc/treatments_cubit.dart';
import '../../features/staff/screens/staff_screen.dart';
import '../../features/staff/screens/staff_invite_screen.dart';
import '../../features/staff/screens/staff_shifts_screen.dart';
import '../../features/staff/screens/staff_leaves_screen.dart';
import '../../features/staff/screens/staff_hr_screen.dart';
import '../../features/staff/bloc/staff_cubit.dart';
import '../../features/orders/screens/orders_screen.dart';
import '../../features/orders/bloc/orders_cubit.dart';
import '../../features/settings/screens/settings_screen.dart';

GoRouter createRouter(AuthCubit authCubit) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: _GoRouterBlocRefreshStream(authCubit.stream),
    redirect: (context, state) {
      final isLoggedIn = authCubit.state.isAuthenticated;
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
            builder: (context, state) => BlocProvider(
              create: (_) => DashboardCubit(),
              child: const OverviewScreen(),
            ),
          ),
          GoRoute(
            path: '/orders',
            builder: (context, state) => BlocProvider(
              create: (_) => OrdersCubit(),
              child: const OrdersScreen(),
            ),
          ),
          GoRoute(
            path: '/customers',
            builder: (context, state) => BlocProvider(
              create: (_) => CustomersCubit(),
              child: const CustomersScreen(),
            ),
          ),
          GoRoute(
            path: '/appointments',
            builder: (context, state) => BlocProvider(
              create: (_) => AppointmentsCubit(),
              child: const AppointmentsScreen(),
            ),
          ),
          GoRoute(
            path: '/treatments',
            builder: (context, state) => BlocProvider(
              create: (_) => TreatmentsCubit(),
              child: const TreatmentsScreen(),
            ),
          ),
          GoRoute(
            path: '/staff',
            builder: (context, state) => BlocProvider(
              create: (_) => StaffCubit(),
              child: const StaffScreen(),
            ),
          ),
          GoRoute(
            path: '/staff/invite',
            builder: (context, state) => const StaffInviteScreen(),
          ),
          GoRoute(
            path: '/staff/shifts',
            builder: (context, state) => const StaffShiftsScreen(),
          ),
          GoRoute(
            path: '/staff/leaves',
            builder: (context, state) => const StaffLeavesScreen(),
          ),
          GoRoute(
            path: '/staff/hr',
            builder: (context, state) => const StaffHrScreen(),
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

/// BLoC stream'ini GoRouter'ın refreshListenable'ı ile bağlar
class _GoRouterBlocRefreshStream extends ChangeNotifier {
  _GoRouterBlocRefreshStream(Stream<dynamic> stream) {
    _subscription = stream.listen((_) => notifyListeners());
  }

  late final dynamic _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
