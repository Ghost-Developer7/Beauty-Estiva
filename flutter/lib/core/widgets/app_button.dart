import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../constants/app_spacing.dart';
import '../constants/app_text_styles.dart';

/// Gradient primary button
class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool fullWidth;
  final double height;
  final IconData? icon;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.fullWidth = true,
    this.height = 48,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: height,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: onPressed != null ? AppColors.primaryGradient : null,
          color: onPressed == null ? AppColors.primary.withValues(alpha: 0.4) : null,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        ),
        child: ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            ),
          ),
          child: isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Row(
                  mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (icon != null) ...[
                      Icon(icon, color: Colors.white, size: 16),
                      AppSpacing.horizontalSm,
                    ],
                    Text(text, style: AppTextStyles.buttonPrimary),
                  ],
                ),
        ),
      ),
    );
  }
}

/// Küçük gradient buton (Ekle, vb.)
class AppButtonSmall extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;

  const AppButtonSmall({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          onTap: onPressed,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(icon, color: Colors.white, size: 16),
                  AppSpacing.horizontalSm,
                ],
                Text(text, style: AppTextStyles.buttonSmall),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
