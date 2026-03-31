import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/widgets/responsive_builder.dart';

class AppTopbar extends StatelessWidget {
  final VoidCallback onMenuTap;

  const AppTopbar({super.key, required this.onMenuTap});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final isMobile = ResponsiveBuilder.isMobile(context);

    return Container(
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 20, vertical: 12),
      decoration: const BoxDecoration(
        color: AppColors.topbarBg,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder)),
      ),
      child: Row(
        children: [
          // Mobile menu button
          if (isMobile)
            IconButton(
              onPressed: onMenuTap,
              icon: const Icon(Icons.menu_rounded, color: AppColors.textNav),
            ),

          const Spacer(),

          // User info
          if (user != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.navIconBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Avatar
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      gradient: AppColors.pinkGradient,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(user.initials,
                          style: const TextStyle(color: Color(0xFF2e174e),
                              fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  if (!isMobile) ...[
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(user.fullName, style: const TextStyle(
                            color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                        Text(user.displayRole.toUpperCase(), style: const TextStyle(
                            color: AppColors.textDim, fontSize: 10,
                            fontWeight: FontWeight.w500, letterSpacing: 2)),
                      ],
                    ),
                    const SizedBox(width: 8),
                  ],
                ],
              ),
            ),
          const SizedBox(width: 8),

          // Logout
          _buildIconButton(Icons.logout_rounded, () async {
            await auth.logout();
            if (context.mounted) context.go('/login');
          }),
        ],
      ),
    );
  }

  Widget _buildIconButton(IconData icon, VoidCallback onTap) {
    return Material(
      color: AppColors.navIconBg,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: SizedBox(
          width: 36, height: 36,
          child: Icon(icon, color: AppColors.textNav, size: 18),
        ),
      ),
    );
  }
}
