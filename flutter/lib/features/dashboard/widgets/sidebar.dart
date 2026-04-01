import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';

// ── Nav yapısı ──

class _NavItem {
  final String label;
  final IconData icon;
  final String route;
  final List<_NavItem> children;

  const _NavItem(this.label, this.icon, this.route, [this.children = const []]);

  bool get hasChildren => children.isNotEmpty;
}

const _navItems = [
  _NavItem('Özet', Icons.dashboard_rounded, '/dashboard'),
  _NavItem('Randevular', Icons.access_time_rounded, '/appointments'),
  _NavItem('Adisyonlar', Icons.receipt_long_rounded, '/orders'),
  _NavItem('Müşteriler', Icons.people_rounded, '/customers'),
  _NavItem('Hizmetler', Icons.content_cut_rounded, '/treatments'),
  _NavItem('Personel', Icons.badge_rounded, '/staff', [
    _NavItem('Personel Listesi', Icons.list_rounded, '/staff'),
    _NavItem('Personel Davet Et', Icons.person_add_rounded, '/staff/invite'),
    _NavItem('Vardiya Yönetimi', Icons.schedule_rounded, '/staff/shifts'),
    _NavItem('İzin Yönetimi', Icons.event_busy_rounded, '/staff/leaves'),
    _NavItem('Özlük Bilgileri', Icons.folder_shared_rounded, '/staff/hr'),
  ]),
  _NavItem('Ayarlar', Icons.settings_rounded, '/settings'),
];

class AppSidebar extends StatefulWidget {
  final VoidCallback onItemTap;
  const AppSidebar({super.key, required this.onItemTap});

  @override
  State<AppSidebar> createState() => _AppSidebarState();
}

class _AppSidebarState extends State<AppSidebar> {
  final Set<String> _expanded = {'/staff'};

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final currentRoute = GoRouterState.of(context).matchedLocation;

    // Personel alt sayfasındaysa otomatik aç
    if (currentRoute.startsWith('/staff')) {
      _expanded.add('/staff');
    }

    return Container(
      width: 256,
      decoration: BoxDecoration(
        gradient: c.sidebarGradient,
        border: Border(right: BorderSide(color: c.sidebarBorder)),
      ),
      child: Column(
        children: [
          // Logo
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(
                    child: Text('E',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold)),
                  ),
                ),
                AppSpacing.horizontalMd,
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ESTIVA', style: AppTextStyles.labelWide(c)),
                    Text('Beauty OS', style: AppTextStyles.bodyLarge(c)),
                  ],
                ),
              ],
            ),
          ),
          AppSpacing.verticalXxl,

          // Nav items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              children: _navItems.map((item) {
                if (item.hasChildren) {
                  return _ExpandableNavGroup(
                    item: item,
                    isExpanded: _expanded.contains(item.route),
                    currentRoute: currentRoute,
                    colors: c,
                    onToggle: () {
                      setState(() {
                        if (_expanded.contains(item.route)) {
                          _expanded.remove(item.route);
                        } else {
                          _expanded.add(item.route);
                        }
                      });
                    },
                    onChildTap: (route) {
                      context.go(route);
                      widget.onItemTap();
                    },
                  );
                }
                final isActive = currentRoute == item.route;
                return _NavTile(
                  item: item,
                  isActive: isActive,
                  colors: c,
                  onTap: () {
                    context.go(item.route);
                    widget.onItemTap();
                  },
                );
              }).toList(),
            ),
          ),

          // Version
          Container(
            padding: AppSpacing.paddingXl,
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: c.cardBorder)),
            ),
            child: Text('version 1.0 / Flutter',
                style: TextStyle(color: c.textDim, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}

/// Expandable menü grubu (Personel gibi)
class _ExpandableNavGroup extends StatelessWidget {
  final _NavItem item;
  final bool isExpanded;
  final String currentRoute;
  final AppColors colors;
  final VoidCallback onToggle;
  final ValueChanged<String> onChildTap;

  const _ExpandableNavGroup({
    required this.item,
    required this.isExpanded,
    required this.currentRoute,
    required this.colors,
    required this.onToggle,
    required this.onChildTap,
  });

  @override
  Widget build(BuildContext context) {
    final isGroupActive = currentRoute.startsWith(item.route);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Ana menü başlığı (tıklanınca expand/collapse)
        Padding(
          padding: const EdgeInsets.only(bottom: 2),
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            child: InkWell(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              hoverColor: colors.navHover,
              onTap: onToggle,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: isGroupActive && !isExpanded
                      ? colors.navActive
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: isGroupActive
                            ? AppColors.primary.withValues(alpha: 0.2)
                            : colors.navIconBg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(item.icon,
                          color: isGroupActive
                              ? colors.navActiveText
                              : colors.textNav,
                          size: 18),
                    ),
                    AppSpacing.horizontalMd,
                    Expanded(
                      child: Text(item.label,
                          style: AppTextStyles.navItem(colors,
                              active: isGroupActive)),
                    ),
                    AnimatedRotation(
                      turns: isExpanded ? 0.25 : 0,
                      duration: const Duration(milliseconds: 200),
                      child: Icon(Icons.chevron_right,
                          color: colors.textDim, size: 16),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // Alt menü öğeleri
        AnimatedCrossFade(
          firstChild: const SizedBox.shrink(),
          secondChild: Padding(
            padding: const EdgeInsets.only(left: 20, bottom: 4),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: item.children.map((child) {
                final isChildActive = currentRoute == child.route;
                return _SubNavTile(
                  item: child,
                  isActive: isChildActive,
                  colors: colors,
                  onTap: () => onChildTap(child.route),
                );
              }).toList(),
            ),
          ),
          crossFadeState: isExpanded
              ? CrossFadeState.showSecond
              : CrossFadeState.showFirst,
          duration: const Duration(milliseconds: 200),
        ),
      ],
    );
  }
}

/// Alt menü öğesi (indented, daha küçük)
class _SubNavTile extends StatelessWidget {
  final _NavItem item;
  final bool isActive;
  final AppColors colors;
  final VoidCallback onTap;

  const _SubNavTile({
    required this.item,
    required this.isActive,
    required this.colors,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 1),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
          hoverColor: colors.navHover,
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: isActive ? colors.navActive : Colors.transparent,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            child: Row(
              children: [
                Icon(item.icon,
                    color: isActive ? colors.navActiveText : colors.textNav,
                    size: 16),
                const SizedBox(width: 10),
                Text(
                  item.label,
                  style: TextStyle(
                    color: isActive ? colors.navActiveText : colors.textNav,
                    fontSize: 12,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Normal nav item (tek seviye)
class _NavTile extends StatelessWidget {
  final _NavItem item;
  final bool isActive;
  final AppColors colors;
  final VoidCallback onTap;

  const _NavTile({
    required this.item,
    required this.isActive,
    required this.colors,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          hoverColor: colors.navHover,
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: isActive ? colors.navActive : Colors.transparent,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: isActive
                        ? AppColors.primary.withValues(alpha: 0.2)
                        : colors.navIconBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(item.icon,
                      color: isActive ? colors.navActiveText : colors.textNav,
                      size: 18),
                ),
                AppSpacing.horizontalMd,
                Text(item.label,
                    style: AppTextStyles.navItem(colors, active: isActive)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
