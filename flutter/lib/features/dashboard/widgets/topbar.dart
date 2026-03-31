import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../core/widgets/responsive_builder.dart';

class AppTopbar extends StatelessWidget {
  final VoidCallback onMenuTap;
  const AppTopbar({super.key, required this.onMenuTap});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final auth = context.watch<AuthProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final user = auth.user;
    final isMobile = ResponsiveBuilder.isMobile(context);

    return Container(
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 24, vertical: 12),
      decoration: BoxDecoration(
        color: c.topbarBg,
        border: Border(bottom: BorderSide(color: c.cardBorder)),
      ),
      child: Row(
        children: [
          if (isMobile)
            _iconBtn(context, Icons.menu_rounded, onMenuTap),

          // Company badge
          if (!isMobile && user != null) ...[
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                gradient: AppColors.pinkGradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(child: Text('G', style: TextStyle(
                  color: Color(0xFF2e174e), fontSize: 13, fontWeight: FontWeight.bold))),
            ),
            const SizedBox(width: 8),
            Text('Glow Atelier', style: TextStyle(
                color: c.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
          ],

          const SizedBox(width: 16),

          // Search bar
          if (!isMobile)
            Expanded(
              child: Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: c.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: c.cardBorder),
                ),
                child: Row(
                  children: [
                    Icon(Icons.search, color: c.textDim, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        style: TextStyle(color: c.textPrimary, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'Müşteri, personel, randevu ara...',
                          hintStyle: TextStyle(color: c.textDim, fontSize: 13),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            const Spacer(),

          const SizedBox(width: 12),

          // Notification
          _iconBtn(context, Icons.notifications_none_rounded, () {}),
          const SizedBox(width: 6),

          if (!isMobile) ...[
            // Language
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: c.navIconBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: c.cardBorder),
              ),
              child: Text('TR', style: TextStyle(
                  color: c.textNav, fontSize: 12, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(width: 6),

            // Theme toggle - ÇALIŞAN
            _iconBtn(
              context,
              themeProvider.isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
              () => themeProvider.toggleTheme(),
            ),
            const SizedBox(width: 12),
          ],

          // User profile
          if (user != null)
            Container(
              padding: EdgeInsets.fromLTRB(4, 4, isMobile ? 4 : 16, 4),
              decoration: BoxDecoration(
                color: c.navIconBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: c.cardBorder),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Stack(
                    children: [
                      Container(
                        width: 36, height: 36,
                        decoration: const BoxDecoration(
                          gradient: AppColors.pinkGradient,
                          shape: BoxShape.circle,
                        ),
                        child: Center(child: Text(user.initials,
                            style: const TextStyle(color: Color(0xFF2e174e),
                                fontSize: 12, fontWeight: FontWeight.bold))),
                      ),
                      Positioned(
                        right: 0, bottom: 0,
                        child: Container(
                          width: 10, height: 10,
                          decoration: BoxDecoration(
                            color: AppColors.green,
                            shape: BoxShape.circle,
                            border: Border.all(color: c.topbarBg, width: 2),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (!isMobile) ...[
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(user.fullName, style: TextStyle(
                            color: c.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                        Text(user.displayRole.toUpperCase(), style: TextStyle(
                            color: c.textDim, fontSize: 9,
                            fontWeight: FontWeight.w500, letterSpacing: 2)),
                      ],
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.keyboard_arrow_down, color: c.textDim, size: 18),
                  ],
                ],
              ),
            ),

          const SizedBox(width: 6),
          _iconBtn(context, Icons.logout_rounded, () async {
            await auth.logout();
            if (context.mounted) context.go('/login');
          }),
        ],
      ),
    );
  }

  Widget _iconBtn(BuildContext context, IconData icon, VoidCallback onTap) {
    final c = AppColors.of(context);
    return Material(
      color: c.navIconBg,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        hoverColor: c.navHover,
        onTap: onTap,
        child: SizedBox(
          width: 36, height: 36,
          child: Icon(icon, color: c.textNav, size: 18),
        ),
      ),
    );
  }
}
