import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Ortak ikon buton bileşeni (topbar, vb.)
class AppIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final double size;

  const AppIconButton({
    super.key,
    required this.icon,
    required this.onTap,
    this.size = 36,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Material(
      color: c.navIconBg,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        hoverColor: c.navHover,
        onTap: onTap,
        child: SizedBox(
          width: size,
          height: size,
          child: Icon(icon, color: c.textNav, size: 18),
        ),
      ),
    );
  }
}
