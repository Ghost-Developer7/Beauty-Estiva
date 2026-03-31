import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/auth_provider.dart';
import 'core/router/app_router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: const BeautyEstivaApp(),
    ),
  );
}

class BeautyEstivaApp extends StatefulWidget {
  const BeautyEstivaApp({super.key});

  @override
  State<BeautyEstivaApp> createState() => _BeautyEstivaAppState();
}

class _BeautyEstivaAppState extends State<BeautyEstivaApp> {
  @override
  void initState() {
    super.initState();
    // Try to restore session on startup
    Future.microtask(() {
      context.read<AuthProvider>().tryRestoreSession();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final router = createRouter(authProvider);

    return MaterialApp.router(
      title: 'Beauty Estiva',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: router,
    );
  }
}
