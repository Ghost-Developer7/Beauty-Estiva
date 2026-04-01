import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../constants/app_spacing.dart';

/// Avatar bileşeni - profil resmi veya inisiyalli fallback
class AppAvatar extends StatelessWidget {
  final String initials;
  final String? imageUrl;
  final double size;
  final Gradient gradient;
  final double fontSize;
  final double borderRadius;
  final bool showOnlineIndicator;

  const AppAvatar({
    super.key,
    required this.initials,
    this.imageUrl,
    this.size = 40,
    this.gradient = AppColors.pinkGradient,
    this.fontSize = 14,
    this.borderRadius = 10,
    this.showOnlineIndicator = false,
  });

  const AppAvatar.circle({
    super.key,
    required this.initials,
    this.imageUrl,
    this.size = 36,
    this.gradient = AppColors.pinkGradient,
    this.fontSize = 12,
    this.showOnlineIndicator = false,
  }) : borderRadius = 100;

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    final Widget avatarContent;
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      // Network profil resmi
      avatarContent = Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(borderRadius),
          border: Border.all(color: c.cardBorder, width: 2),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(borderRadius - 2),
          child: Image.network(
            imageUrl!,
            width: size,
            height: size,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _initialsWidget(),
          ),
        ),
      );
    } else {
      // İnisiyalli fallback
      avatarContent = Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        child: Center(child: _initialsText()),
      );
    }

    if (!showOnlineIndicator) return avatarContent;

    return Stack(
      children: [
        avatarContent,
        Positioned(
          right: 0,
          bottom: 0,
          child: Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: AppColors.green,
              shape: BoxShape.circle,
              border: Border.all(color: c.topbarBg, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _initialsWidget() {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      child: Center(child: _initialsText()),
    );
  }

  Text _initialsText() {
    return Text(
      initials,
      style: TextStyle(
        color: const Color(0xFF2e174e),
        fontSize: fontSize,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}

/// Sıralı numara gösteren avatar (Top personel vb.)
class AppRankAvatar extends StatelessWidget {
  final int rank;
  final Color color;

  const AppRankAvatar({
    super.key,
    required this.rank,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Center(
        child: Text(
          '$rank',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
