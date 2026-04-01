import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../constants/app_spacing.dart';
import '../constants/app_text_styles.dart';

/// Proje genelinde kullanılan kart bileşeni
class AppCard extends StatelessWidget {
  final Widget child;
  final String? title;
  final double? height;
  final EdgeInsets? padding;
  final EdgeInsets? margin;

  const AppCard({
    super.key,
    required this.child,
    this.title,
    this.height,
    this.padding,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Container(
      margin: margin,
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
              child: Text(title!, style: AppTextStyles.sectionTitle(c)),
            ),
          if (height != null)
            SizedBox(
              height: height,
              child: Padding(
                padding: padding ?? const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: child,
              ),
            )
          else
            padding != null
                ? Padding(padding: padding!, child: child)
                : child,
        ],
      ),
    );
  }
}
