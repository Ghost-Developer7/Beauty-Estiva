import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/bloc/theme/theme_cubit.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    return SingleChildScrollView(
      padding: AppSpacing.paddingXxl,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Ayarlar', style: AppTextStyles.heading2(c)),
          AppSpacing.verticalXxl,

          // Theme - sadece theme state değiştiğinde rebuild
          _SettingsCard(
            title: 'TEMA',
            child: Row(
              children: [
                Icon(Icons.brightness_6, color: c.textNav, size: 22),
                AppSpacing.horizontalMd,
                Text('Koyu Tema', style: AppTextStyles.body(c)),
                const Spacer(),
                BlocBuilder<ThemeCubit, bool>(
                  builder: (context, isDark) {
                    return Switch(
                      value: isDark,
                      onChanged: (_) =>
                          context.read<ThemeCubit>().toggleTheme(),
                      activeThumbColor: AppColors.primary,
                    );
                  },
                ),
              ],
            ),
          ),
          AppSpacing.verticalLg,

          // Language
          _SettingsCard(
            title: 'DIL',
            child: Row(
              children: [
                Icon(Icons.translate, color: c.textNav, size: 22),
                AppSpacing.horizontalLg,
                _LangButton(text: 'Turkce', active: true),
                AppSpacing.horizontalSm,
                _LangButton(text: 'English', active: false),
              ],
            ),
          ),
          AppSpacing.verticalLg,

          // App info
          _SettingsCard(
            title: 'UYGULAMA',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Beauty Estiva', style: AppTextStyles.bodyLarge(c)),
                AppSpacing.verticalXs,
                Text('v1.0.0 \u2022 Flutter',
                    style: AppTextStyles.bodySmallMuted(c)),
                Text('Windows / Android / iOS',
                    style: AppTextStyles.bodySmallMuted(c)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsCard extends StatelessWidget {
  final String title;
  final Widget child;
  const _SettingsCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 500),
      padding: AppSpacing.paddingXxl,
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTextStyles.labelWide(c)),
          AppSpacing.verticalLg,
          child,
        ],
      ),
    );
  }
}

class _LangButton extends StatelessWidget {
  final String text;
  final bool active;
  const _LangButton({required this.text, required this.active});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: active ? c.navActive : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: active ? AppColors.primary : c.cardBorder),
      ),
      child: Text(text,
          style: TextStyle(
              color: active ? c.textPrimary : c.textNav, fontSize: 13)),
    );
  }
}
