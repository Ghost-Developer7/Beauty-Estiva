import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class _NavItem {
  final String label;
  final IconData icon;
  final String route;

  const _NavItem(this.label, this.icon, this.route);
}

const _navItems = [
  _NavItem('Ozet', Icons.dashboard_rounded, '/dashboard'),
  _NavItem('Randevular', Icons.access_time_rounded, '/appointments'),
  _NavItem('Musteriler', Icons.people_rounded, '/customers'),
  _NavItem('Hizmetler', Icons.content_cut_rounded, '/treatments'),
  _NavItem('Personel', Icons.badge_rounded, '/staff'),
  _NavItem('Ayarlar', Icons.settings_rounded, '/settings'),
];

class AppSidebar extends StatelessWidget {
  final VoidCallback onItemTap;

  const AppSidebar({super.key, required this.onItemTap});

  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).matchedLocation;

    return Container(
      width: 256,
      decoration: const BoxDecoration(gradient: AppColors.sidebarGradient),
      child: Column(
        children: [
          // Logo
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Row(
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(
                    child: Text('E', style: TextStyle(
                        color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('ESTIVA', style: TextStyle(
                        color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w600,
                        letterSpacing: 3)),
                    Text('Beauty OS', style: TextStyle(
                        color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Nav items
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              itemCount: _navItems.length,
              itemBuilder: (context, index) {
                final item = _navItems[index];
                final isActive = currentRoute == item.route;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 2),
                  child: Material(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () {
                        context.go(item.route);
                        onItemTap();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: isActive ? AppColors.navActive : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36, height: 36,
                              decoration: BoxDecoration(
                                color: isActive
                                    ? Colors.white.withValues(alpha: 0.15)
                                    : AppColors.navIconBg,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(item.icon,
                                  color: isActive ? Colors.white : AppColors.textNav,
                                  size: 18),
                            ),
                            const SizedBox(width: 12),
                            Text(item.label, style: TextStyle(
                              color: isActive ? Colors.white : AppColors.textNav,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            )),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Version
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.cardBorder)),
            ),
            child: const Text('version 1.0 / Flutter',
                style: TextStyle(color: AppColors.textDim, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}
