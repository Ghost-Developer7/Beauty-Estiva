import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/theme_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final themeProvider = context.watch<ThemeProvider>();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Ayarlar', style: TextStyle(
              color: c.textPrimary, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 28),

          // Theme
          _buildCard(
            c: c,
            title: 'TEMA',
            child: Row(
              children: [
                Icon(Icons.brightness_6, color: c.textNav, size: 22),
                const SizedBox(width: 12),
                Text('Koyu Tema', style: TextStyle(color: c.textPrimary, fontSize: 14)),
                const Spacer(),
                Switch(
                  value: themeProvider.isDark,
                  onChanged: (_) => context.read<ThemeProvider>().toggleTheme(),
                  activeColor: AppColors.primary,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Language
          _buildCard(
            c: c,
            title: 'DIL',
            child: Row(
              children: [
                Icon(Icons.translate, color: c.textNav, size: 22),
                const SizedBox(width: 16),
                _buildLangButton('Turkce', true, c),
                const SizedBox(width: 8),
                _buildLangButton('English', false, c),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // App info
          _buildCard(
            c: c,
            title: 'UYGULAMA',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Beauty Estiva', style: TextStyle(
                    color: c.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text('v1.0.0 \u2022 Flutter', style: TextStyle(color: c.textDim, fontSize: 12)),
                Text('Windows / Android / iOS', style: TextStyle(color: c.textDim, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard({required AppColors c, required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 500),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(color: c.textDim, fontSize: 10,
              fontWeight: FontWeight.w600, letterSpacing: 2)),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildLangButton(String text, bool active, AppColors c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: active ? c.navActive : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: active ? AppColors.primary : c.cardBorder),
      ),
      child: Text(text, style: TextStyle(
          color: active ? c.textPrimary : c.textNav, fontSize: 13)),
    );
  }
}
