import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../constants/app_spacing.dart';
import '../constants/app_text_styles.dart';
import 'responsive_builder.dart';

/// Tek bir KPI kartı
class AppKpiCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const AppKpiCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(title, style: AppTextStyles.bodySmallMuted(c)),
        ],
      ),
    );
  }
}

/// Responsive KPI kart satırı - Desktop: row, Mobile: 2x2 grid
class AppKpiRow extends StatelessWidget {
  final List<AppKpiCard> cards;

  const AppKpiRow({super.key, required this.cards});

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveBuilder.isMobile(context);

    if (isMobile) {
      return Column(
        children: [
          Row(
            children: [
              for (int i = 0; i < cards.length && i < 2; i++) ...[
                if (i > 0) AppSpacing.horizontalMd,
                Expanded(child: cards[i]),
              ],
            ],
          ),
          if (cards.length > 2) ...[
            AppSpacing.verticalMd,
            Row(
              children: [
                for (int i = 2; i < cards.length; i++) ...[
                  if (i > 2) AppSpacing.horizontalMd,
                  Expanded(child: cards[i]),
                ],
              ],
            ),
          ],
        ],
      );
    }

    return Row(
      children: [
        for (int i = 0; i < cards.length; i++) ...[
          if (i > 0) AppSpacing.horizontalMd,
          Expanded(child: cards[i]),
        ],
      ],
    );
  }
}
