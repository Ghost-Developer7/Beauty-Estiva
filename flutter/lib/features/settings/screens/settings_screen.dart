import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Ayarlar', style: TextStyle(
              color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 28),

          // Theme
          _buildCard(
            title: 'TEMA',
            child: Row(
              children: [
                const Icon(Icons.brightness_6, color: AppColors.textNav, size: 22),
                const SizedBox(width: 12),
                const Text('Koyu Tema', style: TextStyle(color: Colors.white, fontSize: 14)),
                const Spacer(),
                Switch(
                  value: true,
                  onChanged: (_) {},
                  activeColor: AppColors.primary,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Language
          _buildCard(
            title: 'DIL',
            child: Row(
              children: [
                const Icon(Icons.translate, color: AppColors.textNav, size: 22),
                const SizedBox(width: 16),
                _buildLangButton('Turkce', true),
                const SizedBox(width: 8),
                _buildLangButton('English', false),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // App info
          _buildCard(
            title: 'UYGULAMA',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Beauty Estiva', style: TextStyle(
                    color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                SizedBox(height: 4),
                Text('v1.0.0 • Flutter', style: TextStyle(color: AppColors.textDim, fontSize: 12)),
                Text('Windows / Android / iOS', style: TextStyle(color: AppColors.textDim, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 500),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: AppColors.textDim, fontSize: 10,
              fontWeight: FontWeight.w600, letterSpacing: 2)),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildLangButton(String text, bool active) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: active ? AppColors.navActive : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: active ? AppColors.primary : AppColors.cardBorder),
      ),
      child: Text(text, style: TextStyle(
          color: active ? Colors.white : AppColors.textNav, fontSize: 13)),
    );
  }
}
