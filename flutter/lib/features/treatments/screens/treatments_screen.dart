import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/widgets/app_loading.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/app_kpi_cards.dart';
import '../../../core/models/appointment_models.dart';
import '../bloc/treatments_cubit.dart';
import '../bloc/treatments_state.dart';

class TreatmentsScreen extends StatefulWidget {
  const TreatmentsScreen({super.key});

  @override
  State<TreatmentsScreen> createState() => _TreatmentsScreenState();
}

class _TreatmentsScreenState extends State<TreatmentsScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<TreatmentsCubit>().load();
    _searchController.addListener(_onSearch);
  }

  void _onSearch() {
    context.read<TreatmentsCubit>().search(_searchController.text);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearch);
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
          _Header(c: c),
          AppSpacing.verticalXl,

          // ── KPI Cards ──
          _KpiSection(c: c),
          AppSpacing.verticalXl,

          // ── Search ──
          AppSearchBar(
            controller: _searchController,
            hintText: 'Hizmet ara...',
          ),
          AppSpacing.verticalLg,

          // ── Table ──
          Expanded(
            child: BlocBuilder<TreatmentsCubit, TreatmentsState>(
              buildWhen: (prev, curr) =>
                  prev.status != curr.status ||
                  prev.pagedTreatments != curr.pagedTreatments,
              builder: (context, state) {
                if (state.status == TreatmentsStatus.loading ||
                    state.status == TreatmentsStatus.initial) {
                  return const AppLoading();
                }
                if (state.status == TreatmentsStatus.error) {
                  return AppErrorState(
                    message: state.error ?? 'Veriler yüklenemedi',
                    onRetry: () => context.read<TreatmentsCubit>().load(),
                  );
                }
                if (state.filteredTreatments.isEmpty) {
                  return const AppEmptyState(
                    message: 'Hizmet bulunamadı',
                    icon: Icons.content_cut_rounded,
                  );
                }
                return _TreatmentTable(
                  treatments: state.pagedTreatments,
                  c: c,
                );
              },
            ),
          ),

          // ── Pagination ──
          _PaginationBar(c: c),
        ],
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Header: Title + subtitle + button
// ────────────────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  final AppColors c;
  const _Header({required this.c});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Hizmetler', style: AppTextStyles.heading2(c)),
            AppSpacing.verticalXs,
            BlocSelector<TreatmentsCubit, TreatmentsState, int>(
              selector: (state) => state.totalTreatmentCount,
              builder: (context, count) => Text(
                '$count toplam',
                style: AppTextStyles.bodyMuted(c),
              ),
            ),
          ],
        ),
        AppButtonSmall(
          text: 'Yeni Hizmet',
          icon: Icons.add_rounded,
          onPressed: () {
            // TODO: navigate to create treatment
          },
        ),
      ],
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// KPI Section
// ────────────────────────────────────────────────────────────────────────────

class _KpiSection extends StatelessWidget {
  final AppColors c;
  const _KpiSection({required this.c});

  @override
  Widget build(BuildContext context) {
    return BlocSelector<TreatmentsCubit, TreatmentsState, _KpiSnapshot>(
      selector: (state) => _KpiSnapshot(
        total: state.totalTreatmentCount,
        avgPrice: state.avgPrice,
        avgDuration: state.avgDuration,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
      ),
      builder: (context, kpi) {
        return AppKpiRow(
          cards: [
            AppKpiCard(
              title: 'Toplam Hizmet',
              value: '${kpi.total}',
              icon: Icons.content_cut_rounded,
              color: AppColors.primary,
            ),
            AppKpiCard(
              title: 'Ort. Fiyat',
              value: '₺${kpi.avgPrice.toStringAsFixed(0)}',
              icon: Icons.attach_money_rounded,
              color: AppColors.green,
            ),
            AppKpiCard(
              title: 'Ort. Süre',
              value: '${kpi.avgDuration.toStringAsFixed(0)} dk',
              icon: Icons.schedule_rounded,
              color: AppColors.cyan,
            ),
            AppKpiCard(
              title: 'Fiyat Aralığı',
              value:
                  '₺${kpi.minPrice.toStringAsFixed(0)} — ₺${kpi.maxPrice.toStringAsFixed(0)}',
              icon: Icons.trending_up_rounded,
              color: AppColors.orange,
            ),
          ],
        );
      },
    );
  }
}

class _KpiSnapshot {
  final int total;
  final double avgPrice;
  final double avgDuration;
  final double minPrice;
  final double maxPrice;

  const _KpiSnapshot({
    required this.total,
    required this.avgPrice,
    required this.avgDuration,
    required this.minPrice,
    required this.maxPrice,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is _KpiSnapshot &&
          total == other.total &&
          avgPrice == other.avgPrice &&
          avgDuration == other.avgDuration &&
          minPrice == other.minPrice &&
          maxPrice == other.maxPrice;

  @override
  int get hashCode => Object.hash(total, avgPrice, avgDuration, minPrice, maxPrice);
}

// ────────────────────────────────────────────────────────────────────────────
// Table
// ────────────────────────────────────────────────────────────────────────────

class _TreatmentTable extends StatelessWidget {
  final List<TreatmentListItem> treatments;
  final AppColors c;

  const _TreatmentTable({required this.treatments, required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        children: [
          // Header row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: BoxDecoration(
              color: c.tableHeaderBg,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppSpacing.radiusLg),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 4,
                  child: Text('HİZMET', style: AppTextStyles.tableHeader(c)),
                ),
                Expanded(
                  flex: 2,
                  child: Text('SÜRE', style: AppTextStyles.tableHeader(c)),
                ),
                Expanded(
                  flex: 2,
                  child: Text('FİYAT', style: AppTextStyles.tableHeader(c)),
                ),
                const SizedBox(width: 80),
              ],
            ),
          ),
          // Data rows
          Expanded(
            child: ListView.separated(
              itemCount: treatments.length,
              separatorBuilder: (_, __) =>
                  Divider(height: 1, color: c.cardBorder),
              itemBuilder: (context, index) {
                final isAlt = index.isOdd;
                return _TreatmentRow(
                  treatment: treatments[index],
                  c: c,
                  isAlt: isAlt,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Single Treatment Row
// ────────────────────────────────────────────────────────────────────────────

class _TreatmentRow extends StatefulWidget {
  final TreatmentListItem treatment;
  final AppColors c;
  final bool isAlt;

  const _TreatmentRow({
    required this.treatment,
    required this.c,
    required this.isAlt,
  });

  @override
  State<_TreatmentRow> createState() => _TreatmentRowState();
}

class _TreatmentRowState extends State<_TreatmentRow> {
  bool _hovered = false;

  Color _parseColor(String? hex) {
    if (hex == null || hex.isEmpty) return AppColors.primary;
    final cleaned = hex.replaceFirst('#', '');
    if (cleaned.length == 6) {
      return Color(int.parse('FF$cleaned', radix: 16));
    }
    return AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.treatment;
    final c = widget.c;
    final treatmentColor = _parseColor(t.color);

    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        color: _hovered
            ? c.navHover
            : widget.isAlt
                ? c.tableRowAlt
                : Colors.transparent,
        child: Row(
          children: [
            // ── Treatment name with color bar ──
            Expanded(
              flex: 4,
              child: Row(
                children: [
                  Container(
                    width: 4,
                    height: 36,
                    decoration: BoxDecoration(
                      color: treatmentColor,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(t.name, style: AppTextStyles.tableCellBold(c)),
                        if (t.description != null && t.description!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(
                              t.description!,
                              style: AppTextStyles.bodySmallMuted(c),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // ── Duration ──
            Expanded(
              flex: 2,
              child: Row(
                children: [
                  Icon(Icons.schedule_rounded, size: 14, color: c.textDim),
                  const SizedBox(width: 6),
                  Text('${t.durationMinutes} dk',
                      style: AppTextStyles.tableCell(c)),
                ],
              ),
            ),

            // ── Price ──
            Expanded(
              flex: 2,
              child: Text(
                t.price != null ? '₺${t.price!.toStringAsFixed(0)}' : '—',
                style: AppTextStyles.tableCellBold(c).copyWith(
                  color: AppColors.green,
                ),
              ),
            ),

            // ── Actions ──
            SizedBox(
              width: 80,
              child: AnimatedOpacity(
                opacity: _hovered ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 150),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    _ActionIcon(
                      icon: Icons.edit_outlined,
                      color: c.textDim,
                      onTap: () {
                        // TODO: navigate to edit treatment
                      },
                    ),
                    const SizedBox(width: 4),
                    _ActionIcon(
                      icon: Icons.delete_outline_rounded,
                      color: AppColors.red,
                      onTap: () {
                        context
                            .read<TreatmentsCubit>()
                            .deleteTreatment(t.id);
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionIcon extends StatelessWidget {
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionIcon({
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(6),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Icon(icon, size: 18, color: color),
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Pagination
// ────────────────────────────────────────────────────────────────────────────

class _PaginationBar extends StatelessWidget {
  final AppColors c;
  const _PaginationBar({required this.c});

  @override
  Widget build(BuildContext context) {
    return BlocSelector<TreatmentsCubit, TreatmentsState, _PageInfo>(
      selector: (state) => _PageInfo(
        page: state.safePage,
        totalPages: state.totalPages,
        startIndex: state.startIndex + 1,
        endIndex: state.endIndex,
        totalCount: state.totalCount,
      ),
      builder: (context, info) {
        if (info.totalCount == 0) return const SizedBox.shrink();

        return Padding(
          padding: const EdgeInsets.only(top: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Gösterilen ${info.startIndex}-${info.endIndex} / ${info.totalCount} sonuç',
                style: AppTextStyles.bodySmall(c),
              ),
              Row(
                children: [
                  _PageButton(
                    icon: Icons.chevron_left_rounded,
                    enabled: info.page > 1,
                    onTap: () =>
                        context.read<TreatmentsCubit>().previousPage(),
                    c: c,
                  ),
                  const SizedBox(width: 4),
                  ...List.generate(info.totalPages, (i) {
                    final p = i + 1;
                    final isActive = p == info.page;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: _PageNumberButton(
                        page: p,
                        isActive: isActive,
                        onTap: () =>
                            context.read<TreatmentsCubit>().goToPage(p),
                        c: c,
                      ),
                    );
                  }),
                  const SizedBox(width: 4),
                  _PageButton(
                    icon: Icons.chevron_right_rounded,
                    enabled: info.page < info.totalPages,
                    onTap: () => context.read<TreatmentsCubit>().nextPage(),
                    c: c,
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _PageInfo {
  final int page;
  final int totalPages;
  final int startIndex;
  final int endIndex;
  final int totalCount;

  const _PageInfo({
    required this.page,
    required this.totalPages,
    required this.startIndex,
    required this.endIndex,
    required this.totalCount,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is _PageInfo &&
          page == other.page &&
          totalPages == other.totalPages &&
          startIndex == other.startIndex &&
          endIndex == other.endIndex &&
          totalCount == other.totalCount;

  @override
  int get hashCode =>
      Object.hash(page, totalPages, startIndex, endIndex, totalCount);
}

class _PageButton extends StatelessWidget {
  final IconData icon;
  final bool enabled;
  final VoidCallback onTap;
  final AppColors c;

  const _PageButton({
    required this.icon,
    required this.enabled,
    required this.onTap,
    required this.c,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: enabled ? onTap : null,
      child: Container(
        width: 32,
        height: 32,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: c.cardBg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: c.cardBorder),
        ),
        child: Icon(
          icon,
          size: 18,
          color: enabled ? c.textPrimary : c.textDim,
        ),
      ),
    );
  }
}

class _PageNumberButton extends StatelessWidget {
  final int page;
  final bool isActive;
  final VoidCallback onTap;
  final AppColors c;

  const _PageNumberButton({
    required this.page,
    required this.isActive,
    required this.onTap,
    required this.c,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: isActive ? AppColors.primaryGradient : null,
          color: isActive ? null : c.cardBg,
          borderRadius: BorderRadius.circular(8),
          border: isActive ? null : Border.all(color: c.cardBorder),
        ),
        child: Text(
          '$page',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isActive ? Colors.white : c.textPrimary,
          ),
        ),
      ),
    );
  }
}
