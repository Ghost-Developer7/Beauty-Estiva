import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../constants/app_text_styles.dart';

/// Ortak sayfalama bileşeni
class AppPagination extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final ValueChanged<int> onPageChanged;

  const AppPagination({
    super.key,
    required this.currentPage,
    required this.totalPages,
    required this.onPageChanged,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final hasPrev = currentPage > 1;
    final hasNext = currentPage < totalPages;

    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          TextButton(
            onPressed: hasPrev ? () => onPageChanged(currentPage - 1) : null,
            child: Text(
              'Önceki',
              style: TextStyle(color: hasPrev ? c.textNav : c.textDim),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              '$currentPage / $totalPages',
              style: AppTextStyles.bodySmall(c),
            ),
          ),
          TextButton(
            onPressed: hasNext ? () => onPageChanged(currentPage + 1) : null,
            child: Text(
              'Sonraki',
              style: TextStyle(color: hasNext ? c.textNav : c.textDim),
            ),
          ),
        ],
      ),
    );
  }
}
