import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../constants/app_text_styles.dart';

/// Merkezi loading göstergesi
class AppLoading extends StatelessWidget {
  const AppLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: CircularProgressIndicator(color: AppColors.primary),
    );
  }
}

/// Veri yok / hata mesajı
class AppEmptyState extends StatelessWidget {
  final String message;
  final IconData? icon;

  const AppEmptyState({
    super.key,
    required this.message,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, color: c.textDim, size: 48),
            const SizedBox(height: 12),
          ],
          Text(message, style: AppTextStyles.bodySmall(c)),
        ],
      ),
    );
  }
}

/// Hata durumu
class AppErrorState extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const AppErrorState({
    super.key,
    required this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, color: AppColors.red, size: 48),
          const SizedBox(height: 12),
          Text(message, style: AppTextStyles.bodySmall(c)),
          if (onRetry != null) ...[
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Tekrar Dene'),
            ),
          ],
        ],
      ),
    );
  }
}
