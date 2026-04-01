import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Hover efektli tablo satırı wrapper
class AppHoverRow extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;

  const AppHoverRow({super.key, required this.child, this.onTap});

  @override
  State<AppHoverRow> createState() => _AppHoverRowState();
}

class _AppHoverRowState extends State<AppHoverRow> {
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return MouseRegion(
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          color: _hovering ? c.navHover : Colors.transparent,
          child: widget.child,
        ),
      ),
    );
  }
}
