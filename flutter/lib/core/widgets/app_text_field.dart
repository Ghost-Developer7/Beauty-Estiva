import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../constants/app_text_styles.dart';

/// Ortak text field bileşeni
class AppTextField extends StatelessWidget {
  final TextEditingController? controller;
  final String? hintText;
  final String? label;
  final bool obscureText;
  final Widget? suffixIcon;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onSubmitted;
  final bool autofocus;

  const AppTextField({
    super.key,
    this.controller,
    this.hintText,
    this.label,
    this.obscureText = false,
    this.suffixIcon,
    this.keyboardType,
    this.onSubmitted,
    this.autofocus = false,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          Text(label!, style: AppTextStyles.caption(c)),
          const SizedBox(height: 6),
        ],
        TextField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          autofocus: autofocus,
          style: AppTextStyles.body(c),
          decoration: InputDecoration(
            hintText: hintText,
            suffixIcon: suffixIcon,
          ),
          onSubmitted: onSubmitted,
        ),
      ],
    );
  }
}

/// Arama çubuğu bileşeni
class AppSearchBar extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final ValueChanged<String>? onSubmitted;

  const AppSearchBar({
    super.key,
    required this.controller,
    this.hintText = 'Ara...',
    this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c.cardBorder),
      ),
      child: Row(
        children: [
          Icon(Icons.search, color: c.textDim, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: controller,
              style: AppTextStyles.body(c),
              decoration: InputDecoration(
                hintText: hintText,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
              ),
              onSubmitted: onSubmitted,
            ),
          ),
        ],
      ),
    );
  }
}
