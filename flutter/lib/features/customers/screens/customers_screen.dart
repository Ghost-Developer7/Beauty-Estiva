import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/app_loading.dart';
import '../../../core/widgets/app_pagination.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_kpi_cards.dart';
import '../../../core/models/customer_models.dart';
import '../bloc/customers_cubit.dart';
import '../bloc/customers_state.dart';

// ── Avatar gradient pairs cycled by customer index ──
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

// ── Segment badge colors ──
Color _segmentColor(String segment) {
  switch (segment.toLowerCase()) {
    case 'vip':
      return const Color(0xFFf59e0b);
    case 'düzenli':
    case 'regular':
      return const Color(0xFF3b82f6);
    case 'yeni':
    case 'new':
      return const Color(0xFF10b981);
    case 'kayıp':
    case 'lost':
      return const Color(0xFFef4444);
    default:
      return const Color(0xFF6b7280);
  }
}

String _segmentLabel(String segment) {
  switch (segment.toLowerCase()) {
    case 'vip':
      return 'VIP';
    case 'düzenli':
    case 'regular':
      return 'Düzenli';
    case 'yeni':
    case 'new':
      return 'Yeni';
    case 'kayıp':
    case 'lost':
      return 'Kayıp';
    default:
      return segment;
  }
}

// ── Tag badge color ──
Color _tagColor(String tag) {
  final t = tag.toLowerCase();
  if (t == 'vip') return const Color(0xFFf59e0b);
  if (t == 'düzenli' || t == 'regular') return const Color(0xFF3b82f6);
  if (t == 'yeni' || t == 'new') return const Color(0xFF10b981);
  if (t.contains('hafta sonu') || t.contains('weekend')) {
    return const Color(0xFF8b5cf6);
  }
  return const Color(0xFF6b7280);
}

String _formatCurrencyFull(double value) {
  final parts = value.toStringAsFixed(0).split('');
  final buf = StringBuffer();
  for (var i = 0; i < parts.length; i++) {
    if (i > 0 && (parts.length - i) % 3 == 0) buf.write('.');
    buf.write(parts[i]);
  }
  return '$buf ₺';
}

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<CustomersCubit>().load();
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
          BlocSelector<CustomersCubit, CustomersState, int>(
            selector: (state) => state.totalCount,
            builder: (context, totalCount) {
              return Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Müşteriler', style: AppTextStyles.heading2(c)),
                      const SizedBox(height: 4),
                      Text(
                        '$totalCount toplam',
                        style: AppTextStyles.bodyMuted(c),
                      ),
                    ],
                  ),
                  const Spacer(),
                  AppButtonSmall(
                    text: 'Yeni Müşteri',
                    icon: Icons.add,
                    onPressed: () {},
                  ),
                ],
              );
            },
          ),
          AppSpacing.verticalLg,

          // ── KPI Cards ──
          BlocSelector<CustomersCubit, CustomersState,
              (int, int, double, double)>(
            selector: (state) => (
              state.totalCustomerCount,
              state.vipCount,
              state.totalRevenue,
              state.avgSpend,
            ),
            builder: (context, kpi) {
              return AppKpiRow(
                cards: [
                  AppKpiCard(
                    title: 'Toplam Müşteri',
                    value: '${kpi.$1}',
                    icon: Icons.people_outline,
                    color: AppColors.accent,
                  ),
                  AppKpiCard(
                    title: 'VIP Müşteri',
                    value: '${kpi.$2}',
                    icon: Icons.star_outline,
                    color: AppColors.orange,
                  ),
                  AppKpiCard(
                    title: 'Toplam Gelir',
                    value: _formatCurrencyFull(kpi.$3),
                    icon: Icons.attach_money,
                    color: AppColors.primary,
                  ),
                  AppKpiCard(
                    title: 'Ort. Harcama',
                    value: _formatCurrencyFull(kpi.$4),
                    icon: Icons.trending_up,
                    color: AppColors.cyan,
                  ),
                ],
              );
            },
          ),
          AppSpacing.verticalLg,

          // ── Search ──
          AppSearchBar(
            controller: _searchController,
            hintText: 'Ad, telefon veya e-posta ile arayın...',
            onSubmitted: (v) => context.read<CustomersCubit>().setSearch(v),
          ),
          AppSpacing.verticalLg,

          // ── Table ──
          Expanded(
            child: BlocBuilder<CustomersCubit, CustomersState>(
              buildWhen: (prev, curr) =>
                  prev.status != curr.status ||
                  prev.customers != curr.customers,
              builder: (context, state) {
                if (state.status == CustomersStatus.loading ||
                    state.status == CustomersStatus.initial) {
                  return const AppLoading();
                }
                if (state.status == CustomersStatus.error) {
                  return AppErrorState(
                    message: state.error ?? 'Bir hata oluştu',
                    onRetry: () => context.read<CustomersCubit>().load(),
                  );
                }
                if (state.customers.isEmpty) {
                  return const AppEmptyState(
                    message: 'Müşteri bulunamadı',
                    icon: Icons.people_outline,
                  );
                }
                return _CustomersTable(customers: state.customers);
              },
            ),
          ),

          // ── Pagination ──
          BlocSelector<CustomersCubit, CustomersState, (int, int)>(
            selector: (state) => (state.page, state.totalPages),
            builder: (context, pageInfo) {
              return AppPagination(
                currentPage: pageInfo.$1,
                totalPages: pageInfo.$2,
                onPageChanged: (p) =>
                    context.read<CustomersCubit>().setPage(p),
              );
            },
          ),
        ],
      ),
    );
  }
}

// ── Customers Table ──
class _CustomersTable extends StatelessWidget {
  final List<CustomerListItem> customers;
  const _CustomersTable({required this.customers});

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
                DataColumn(label: Text('MÜŞTERİ')),
                DataColumn(label: Text('BİLGİ/İLETİŞİM')),
                DataColumn(label: Text('ZİYARET'), numeric: true),
                DataColumn(label: Text('PUAN'), numeric: true),
                DataColumn(label: Text('HARCAMA'), numeric: true),
                DataColumn(label: Text('SEGMENT')),
                DataColumn(label: Text('İŞLEMLER')),
              ],
              rows: List.generate(customers.length, (index) {
                final cust = customers[index];
                final gradient =
                    _avatarGradients[index % _avatarGradients.length];
                final initials = _getInitials(cust.name, cust.surname);

                return DataRow(
                  color: WidgetStateProperty.resolveWith((states) {
                    if (index.isOdd) return c.tableRowAlt;
                    return c.cardBg;
                  }),
                  cells: [
                    // Müşteri: Avatar + Name + Tags
                    DataCell(_CustomerCell(
                      initials: initials,
                      gradient: gradient,
                      fullName: cust.fullName,
                      tags: cust.tags,
                      segment: cust.segment,
                    )),
                    // Bilgi/İletişim
                    DataCell(Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(cust.phone, style: AppTextStyles.tableCell(c)),
                        if (cust.email != null && cust.email!.isNotEmpty)
                          Text(
                            cust.email!,
                            style: AppTextStyles.bodySmallMuted(c),
                          ),
                      ],
                    )),
                    // Ziyaret
                    DataCell(Text('${cust.totalVisits}')),
                    // Puan
                    DataCell(Text(
                      '${cust.loyaltyPoints}',
                      style: AppTextStyles.tableCellBold(c).copyWith(
                        color: AppColors.orange,
                      ),
                    )),
                    // Harcama
                    DataCell(Text(
                      _formatCurrencyFull(cust.totalSpent),
                      style: AppTextStyles.tableCellBold(c),
                    )),
                    // Segment
                    DataCell(_SegmentBadge(segment: cust.segment)),
                    // Actions
                    DataCell(Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: Icon(Icons.edit_outlined,
                              size: 18, color: c.textNav),
                          onPressed: () {},
                          tooltip: 'Düzenle',
                          splashRadius: 18,
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline,
                              size: 18, color: AppColors.red),
                          onPressed: () => context
                              .read<CustomersCubit>()
                              .deleteCustomer(cust.id),
                          tooltip: 'Sil',
                          splashRadius: 18,
                        ),
                      ],
                    )),
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

// ── Customer cell: avatar + name + tags ──
class _CustomerCell extends StatelessWidget {
  final String initials;
  final LinearGradient gradient;
  final String fullName;
  final List<String> tags;
  final String segment;

  const _CustomerCell({
    required this.initials,
    required this.gradient,
    required this.fullName,
    required this.tags,
    required this.segment,
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
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(fullName, style: AppTextStyles.tableCellBold(c)),
            if (tags.isNotEmpty) ...[
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: tags.take(3).map((tag) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 4),
                    child: _TagBadge(tag: tag),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ],
    );
  }
}

// ── Tag badge (inline small) ──
class _TagBadge extends StatelessWidget {
  final String tag;
  const _TagBadge({required this.tag});

  @override
  Widget build(BuildContext context) {
    final color = _tagColor(tag);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        tag,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

// ── Segment badge ──
class _SegmentBadge extends StatelessWidget {
  final String segment;
  const _SegmentBadge({required this.segment});

  @override
  Widget build(BuildContext context) {
    final color = _segmentColor(segment);
    final label = _segmentLabel(segment);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
