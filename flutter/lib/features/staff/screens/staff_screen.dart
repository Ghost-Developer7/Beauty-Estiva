import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/widgets/app_loading.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_status_badge.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/app_kpi_cards.dart';
import '../../../core/models/appointment_models.dart';
import '../bloc/staff_cubit.dart';
import '../bloc/staff_state.dart';

// ── Avatar gradient pairs cycled by staff index ──
const _avatarGradients = [
  LinearGradient(colors: [Color(0xFFffd1dc), Color(0xFFf3a4ff)]), // pink
  LinearGradient(colors: [Color(0xFFddd6fe), Color(0xFFa78bfa)]), // violet
  LinearGradient(colors: [Color(0xFFbfdbfe), Color(0xFF60a5fa)]), // blue
  LinearGradient(colors: [Color(0xFFa7f3d0), Color(0xFF34d399)]), // emerald
  LinearGradient(colors: [Color(0xFFfde68a), Color(0xFFfbbf24)]), // amber
  LinearGradient(colors: [Color(0xFFa5f3fc), Color(0xFF22d3ee)]), // cyan
  LinearGradient(colors: [Color(0xFFf5d0fe), Color(0xFFe879f9)]), // fuchsia
  LinearGradient(colors: [Color(0xFFd9f99d), Color(0xFFa3e635)]), // lime
];

// ── Role badge color ──
Color _roleColor(String role) {
  switch (role.toLowerCase()) {
    case 'owner':
      return const Color(0xFFf59e0b);
    case 'admin':
      return const Color(0xFF8b5cf6);
    case 'staff':
      return const Color(0xFF3b82f6);
    default:
      return const Color(0xFF6b7280);
  }
}

class StaffScreen extends StatefulWidget {
  const StaffScreen({super.key});

  @override
  State<StaffScreen> createState() => _StaffScreenState();
}

class _StaffScreenState extends State<StaffScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<StaffCubit>().load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    return Padding(
      padding: AppSpacing.paddingXxl,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──
          BlocSelector<StaffCubit, StaffState, int>(
            selector: (state) => state.totalCount,
            builder: (context, totalCount) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Personel Listesi', style: AppTextStyles.heading2(c)),
                  const SizedBox(height: 4),
                  Text(
                    '$totalCount toplam personel',
                    style: AppTextStyles.bodyMuted(c),
                  ),
                ],
              );
            },
          ),
          AppSpacing.verticalLg,

          // ── KPI Cards ──
          BlocSelector<StaffCubit, StaffState, (int, int, int, int)>(
            selector: (state) => (
              state.totalCount,
              state.activeCount,
              state.ownerCount,
              state.adminCount,
            ),
            builder: (context, kpi) {
              return AppKpiRow(
                cards: [
                  AppKpiCard(
                    title: 'Toplam Personel',
                    value: '${kpi.$1}',
                    icon: Icons.people_outline,
                    color: AppColors.primary,
                  ),
                  AppKpiCard(
                    title: 'Aktif Personel',
                    value: '${kpi.$2}',
                    icon: Icons.check_circle_outline,
                    color: AppColors.green,
                  ),
                  AppKpiCard(
                    title: 'Owner',
                    value: '${kpi.$3}',
                    icon: Icons.shield_outlined,
                    color: AppColors.orange,
                  ),
                  AppKpiCard(
                    title: 'Admin',
                    value: '${kpi.$4}',
                    icon: Icons.admin_panel_settings_outlined,
                    color: const Color(0xFF8b5cf6),
                  ),
                ],
              );
            },
          ),
          AppSpacing.verticalLg,

          // ── Search ──
          AppSearchBar(
            controller: _searchController,
            hintText: 'Ad, e-posta veya telefon ile arayın...',
            onSubmitted: (v) => context.read<StaffCubit>().setSearch(v),
          ),
          AppSpacing.verticalLg,

          // ── Table ──
          Expanded(
            child: BlocBuilder<StaffCubit, StaffState>(
              buildWhen: (prev, curr) =>
                  prev.status != curr.status ||
                  prev.staff != curr.staff ||
                  prev.search != curr.search,
              builder: (context, state) {
                if (state.status == StaffStatus.loading ||
                    state.status == StaffStatus.initial) {
                  return const AppLoading();
                }
                if (state.status == StaffStatus.error) {
                  return AppErrorState(
                    message: state.error ?? 'Bir hata olustu',
                    onRetry: () => context.read<StaffCubit>().load(),
                  );
                }
                final filtered = state.filteredStaff;
                if (filtered.isEmpty) {
                  return const AppEmptyState(
                    message: 'Personel bulunamadi',
                    icon: Icons.people_outline,
                  );
                }
                return _StaffTable(staff: filtered);
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ── Staff Table ──
class _StaffTable extends StatelessWidget {
  final List<StaffMember> staff;
  const _StaffTable({required this.staff});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Container(
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        child: SingleChildScrollView(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowColor: WidgetStateProperty.all(c.tableHeaderBg),
              dataRowColor: WidgetStateProperty.resolveWith((states) {
                return c.cardBg;
              }),
              headingTextStyle: AppTextStyles.tableHeader(c),
              dataTextStyle: AppTextStyles.tableCell(c),
              columnSpacing: 28,
              horizontalMargin: 20,
              columns: const [
                DataColumn(label: Text('PERSONEL')),
                DataColumn(label: Text('ILETISIM')),
                DataColumn(label: Text('ROLLER')),
                DataColumn(label: Text('DURUM')),
              ],
              rows: List.generate(staff.length, (index) {
                final s = staff[index];
                final gradient =
                    _avatarGradients[index % _avatarGradients.length];
                final initials = _getInitials(s.name, s.surname);

                return DataRow(
                  color: WidgetStateProperty.resolveWith((states) {
                    if (index.isOdd) return c.tableRowAlt;
                    return c.cardBg;
                  }),
                  cells: [
                    // Personel: Avatar + Name
                    DataCell(_StaffNameCell(
                      initials: initials,
                      gradient: gradient,
                      fullName: s.fullName,
                    )),
                    // Iletisim: email + phone
                    DataCell(_ContactCell(
                      email: s.email,
                      phone: s.phone,
                    )),
                    // Roller: role badges
                    DataCell(_RolesBadges(roles: s.roles)),
                    // Durum: active/inactive
                    DataCell(AppStatusBadge.active(s.isActive)),
                  ],
                );
              }),
            ),
          ),
        ),
      ),
    );
  }

  String _getInitials(String name, String surname) {
    final n = name.isNotEmpty ? name[0].toUpperCase() : '';
    final s = surname.isNotEmpty ? surname[0].toUpperCase() : '';
    return '$n$s';
  }
}

// ── Staff name cell: avatar + name ──
class _StaffNameCell extends StatelessWidget {
  final String initials;
  final LinearGradient gradient;
  final String fullName;

  const _StaffNameCell({
    required this.initials,
    required this.gradient,
    required this.fullName,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        AppAvatar(
          initials: initials,
          gradient: gradient,
          size: 36,
          borderRadius: AppSpacing.radiusSm,
          fontSize: 13,
        ),
        const SizedBox(width: 12),
        Text(fullName, style: AppTextStyles.tableCellBold(c)),
      ],
    );
  }
}

// ── Contact cell: email + phone ──
class _ContactCell extends StatelessWidget {
  final String email;
  final String? phone;

  const _ContactCell({
    required this.email,
    this.phone,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(email, style: AppTextStyles.tableCell(c)),
        if (phone != null && phone!.isNotEmpty)
          Text(phone!, style: AppTextStyles.bodySmallMuted(c)),
      ],
    );
  }
}

// ── Role badges ──
class _RolesBadges extends StatelessWidget {
  final List<String> roles;
  const _RolesBadges({required this.roles});

  @override
  Widget build(BuildContext context) {
    if (roles.isEmpty) {
      return Text('-', style: AppTextStyles.bodySmallMuted(AppColors.of(context)));
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: roles.map((role) {
        final color = _roleColor(role);
        return Padding(
          padding: const EdgeInsets.only(right: 4),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: color.withValues(alpha: 0.3)),
            ),
            child: Text(
              role,
              style: TextStyle(
                color: color,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
