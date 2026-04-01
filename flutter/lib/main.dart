import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'core/theme/app_theme.dart';
import 'core/bloc/auth/auth_cubit.dart';
import 'core/bloc/theme/theme_cubit.dart';
import 'package:go_router/go_router.dart';
import 'core/router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('tr_TR', null);

  final authCubit = AuthCubit();
  final themeCubit = ThemeCubit();

  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider.value(value: authCubit),
        BlocProvider.value(value: themeCubit),
      ],
      child: BeautyEstivaApp(authCubit: authCubit),
    ),
  );
}

class BeautyEstivaApp extends StatefulWidget {
  final AuthCubit authCubit;
  const BeautyEstivaApp({super.key, required this.authCubit});

  @override
  State<BeautyEstivaApp> createState() => _BeautyEstivaAppState();
}

class _BeautyEstivaAppState extends State<BeautyEstivaApp> {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _router = createRouter(widget.authCubit);
    widget.authCubit.tryRestoreSession();
  }

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Sadece theme değiştiğinde MaterialApp rebuild olur
    return BlocBuilder<ThemeCubit, bool>(
      builder: (context, isDark) {
        return MaterialApp.router(
          title: 'Beauty Estiva',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
          routerConfig: _router,
        );
      },
    );
  }
}
