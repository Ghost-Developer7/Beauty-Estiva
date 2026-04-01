import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_loading.dart';
import '../../../core/widgets/app_pagination.dart';
import '../../../core/widgets/app_avatar.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_kpi_cards.dart';
import '../../../core/widgets/responsive_builder.dart';
import '../../../core/models/payment_models.dart';
import '../bloc/orders_cubit.dart';
import '../bloc/orders_state.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _searchController = TextEditingController();
  final _currencyFormat = NumberFormat.currency(locale: 'tr_TR', symbol: '\u20BA', decimalDigits: 2);

  @override
  void initState() {
    super.initState();
    context.read<OrdersCubit>().load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final isDesktop = ResponsiveBuilder.isDesktop(context);
    final isMobile = ResponsiveBuilder.isMobile(context);

    return Scaffold(
      backgroundColor: c.scaffoldBg,
      body: SingleChildScrollView(
        padding: AppSpacing.screenPadding(isDesktop),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──
            _buildHeader(c, isMobile),
            AppSpacing.verticalXxl,

            // ── KPI Cards ──
            _buildKpiRow(c, isMobile),
            AppSpacing.verticalXxl,

            // ── Filters ──
            _buildFilters(c, isMobile),
            AppSpacing.verticalLg,

            // ── Table ──
            _buildTable(c, isDesktop, isMobile),
          ],
        ),
      ),
    );
  }

  // ────────────────────────── Header ──────────────────────────

  Widget _buildHeader(AppColors c, bool isMobile) {
    return BlocSelector<OrdersCubit, OrdersState, int>(
      selector: (s) => s.totalCount,
      builder: (context, totalCount) {
        return Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          runSpacing: 12,
          spacing: 16,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Adisyonlar / Odemeler', style: AppTextStyles.heading2(c)),
                const SizedBox(height: 4),
                Text(
                  '$totalCount toplam',
                  style: AppTextStyles.bodyMuted(c),
                ),
              ],
            ),
            if (!isMobile) const Spacer(),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _ExportButton(
                  icon: Icons.table_chart_outlined,
                  label: 'Excel',
                  color: AppColors.green,
                  onTap: () {},
                ),
                AppSpacing.horizontalSm,
                _ExportButton(
                  icon: Icons.picture_as_pdf_outlined,
                  label: 'PDF',
                  color: AppColors.red,
                  onTap: () {},
                ),
                AppSpacing.horizontalLg,
                AppButtonSmall(
                  text: 'Yeni Odeme',
                  icon: Icons.add,
                  onPressed: () {},
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  // ────────────────────────── KPI Cards ──────────────────────────

  Widget _buildKpiRow(AppColors c, bool isMobile) {
    return BlocBuilder<OrdersCubit, OrdersState>(
      buildWhen: (p, n) =>
          p.totalRevenue != n.totalRevenue ||
          p.avgPayment != n.avgPayment ||
          p.totalCount != n.totalCount ||
          p.topMethod != n.topMethod ||
          p.topMethodCount != n.topMethodCount,
      builder: (context, state) {
        return AppKpiRow(
          cards: [
            AppKpiCard(
              title: 'Toplam Gelir',
              value: _currencyFormat.format(state.totalRevenue),
              icon: Icons.trending_up,
              color: AppColors.green,
            ),
            AppKpiCard(
              title: 'Ort. Odeme',
              value: _currencyFormat.format(state.avgPayment),
              icon: Icons.analytics_outlined,
              color: AppColors.primary,
            ),
            AppKpiCard(
              title: 'Odeme Sayisi',
              value: '${state.totalCount}',
              icon: Icons.receipt_long_outlined,
              color: AppColors.accent,
            ),
            AppKpiCard(
              title: 'En Cok Kullanilan',
              value: state.topMethod,
              icon: Icons.star_outline,
              color: AppColors.orange,
            ),
          ],
        );
      },
    );
  }

  // ────────────────────────── Filters ──────────────────────────

  Widget _buildFilters(AppColors c, bool isMobile) {
    return AppCard(
      padding: const EdgeInsets.all(16),
      child: Wrap(
        spacing: 12,
        runSpacing: 12,
        crossAxisAlignment: WrapCrossAlignment.end,
        children: [
          _DateFilterButton(
            c: c,
            label: 'Baslangic',
            icon: Icons.calendar_today,
            onTap: () => _pickDate(isStart: true),
          ),
          _DateFilterButton(
            c: c,
            label: 'Bitis',
            icon: Icons.calendar_today,
            onTap: () => _pickDate(isStart: false),
          ),
          SizedBox(
            width: isMobile ? double.infinity : 220,
            child: _buildSearchField(c),
          ),
          BlocSelector<OrdersCubit, OrdersState, String?>(
            selector: (s) => s.startDate != null || s.endDate != null || s.staffFilter != null ? 'active' : null,
            builder: (context, hasFilters) {
              if (hasFilters == null) return const SizedBox.shrink();
              return TextButton.icon(
                onPressed: () {
                  context.read<OrdersCubit>().setDateRange(null, null);
                },
                icon: const Icon(Icons.clear, size: 16),
                label: Text('Temizle', style: TextStyle(color: c.textMuted, fontSize: 13)),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSearchField(AppColors c) {
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: c.inputBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: c.inputBorder),
      ),
      child: Row(
        children: [
          Icon(Icons.search, color: c.textDim, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: _searchController,
              style: AppTextStyles.body(c).copyWith(fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Musteri, hizmet ara...',
                hintStyle: TextStyle(color: c.textDim, fontSize: 13),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
              onSubmitted: (v) => context.read<OrdersCubit>().setSearch(v),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickDate({required bool isStart}) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: DateTime(2020),
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null && mounted) {
      final formatted = DateFormat('yyyy-MM-dd').format(picked);
      final cubit = context.read<OrdersCubit>();
      if (isStart) {
        cubit.setDateRange(formatted, cubit.state.endDate);
      } else {
        cubit.setDateRange(cubit.state.startDate, formatted);
      }
    }
  }

  // ────────────────────────── Table ──────────────────────────

  Widget _buildTable(AppColors c, bool isDesktop, bool isMobile) {
    return BlocBuilder<OrdersCubit, OrdersState>(
      builder: (context, state) {
        if (state.status == OrdersStatus.loading && state.payments.isEmpty) {
          return const SizedBox(height: 300, child: AppLoading());
        }

        if (state.status == OrdersStatus.error) {
          return AppErrorState(
            message: state.error ?? 'Bir hata olustu',
            onRetry: () => context.read<OrdersCubit>().load(),
          );
        }

        if (state.payments.isEmpty && state.status == OrdersStatus.loaded) {
          return const SizedBox(
            height: 200,
            child: AppEmptyState(
              message: 'Henuz odeme kaydı bulunamadı',
              icon: Icons.receipt_long_outlined,
            ),
          );
        }

        return AppCard(
          child: Column(
            children: [
              // Table header
              _buildTableHeader(c, isDesktop, isMobile),

              // Table rows
              ...List.generate(state.payments.length, (i) {
                final payment = state.payments[i];
                final isAlt = i.isOdd;
                return _buildTableRow(c, payment, isAlt, isDesktop, isMobile);
              }),

              // Footer
              _buildTableFooter(c, state),

              // Pagination
              if (state.totalPages > 1)
                AppPagination(
                  currentPage: state.page,
                  totalPages: state.totalPages,
                  onPageChanged: (p) => context.read<OrdersCubit>().setPage(p),
                ),
              AppSpacing.verticalMd,
            ],
          ),
        );
      },
    );
  }

  Widget _buildTableHeader(AppColors c, bool isDesktop, bool isMobile) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        color: c.tableHeaderBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Row(
        children: [
          Expanded(flex: 3, child: Text('MUSTERI', style: AppTextStyles.tableHeader(c))),
          if (!isMobile) Expanded(flex: 3, child: Text('HIZMET', style: AppTextStyles.tableHeader(c))),
          if (isDesktop) Expanded(flex: 2, child: Text('PERSONEL', style: AppTextStyles.tableHeader(c))),
          if (isDesktop) Expanded(flex: 2, child: Text('TARIH', style: AppTextStyles.tableHeader(c))),
          Expanded(flex: 2, child: Text('TUTAR', style: AppTextStyles.tableHeader(c))),
          Expanded(flex: 2, child: Text('YONTEM', style: AppTextStyles.tableHeader(c))),
          const SizedBox(width: 48),
        ],
      ),
    );
  }

  Widget _buildTableRow(
    AppColors c,
    PaymentListItem payment,
    bool isAlt,
    bool isDesktop,
    bool isMobile,
  ) {
    final initials = _getInitials(payment.customerFullName);
    final dateStr = _formatDate(payment.appointmentStartTime);
    final methodColor = _paymentMethodColor(payment.paymentMethodValue);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: isAlt ? c.tableRowAlt : Colors.transparent,
      ),
      child: Row(
        children: [
          // Customer
          Expanded(
            flex: 3,
            child: Row(
              children: [
                AppAvatar(initials: initials, size: 34, fontSize: 12, borderRadius: 10),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        payment.customerFullName,
                        style: AppTextStyles.tableCellBold(c),
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (isMobile)
                        Text(
                          payment.treatmentName,
                          style: AppTextStyles.bodySmallMuted(c),
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Treatment (hidden on mobile)
          if (!isMobile)
            Expanded(
              flex: 3,
              child: Text(
                payment.treatmentName,
                style: AppTextStyles.tableCell(c),
                overflow: TextOverflow.ellipsis,
              ),
            ),

          // Staff (desktop only)
          if (isDesktop)
            Expanded(
              flex: 2,
              child: Text(
                payment.staffFullName,
                style: AppTextStyles.tableCell(c),
                overflow: TextOverflow.ellipsis,
              ),
            ),

          // Date (desktop only)
          if (isDesktop)
            Expanded(
              flex: 2,
              child: Text(
                dateStr,
                style: AppTextStyles.tableCell(c),
              ),
            ),

          // Amount
          Expanded(
            flex: 2,
            child: Text(
              _currencyFormat.format(payment.amountInTry),
              style: AppTextStyles.tableCellBold(c).copyWith(
                color: AppColors.green,
              ),
            ),
          ),

          // Payment method badge
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: methodColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: methodColor.withValues(alpha: 0.3)),
              ),
              child: Text(
                payment.paymentMethodDisplay,
                textAlign: TextAlign.center,
                style: AppTextStyles.badge(color: methodColor),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),

          // Delete action
          SizedBox(
            width: 48,
            child: Center(
              child: IconButton(
                onPressed: () => _confirmDelete(payment),
                icon: Icon(Icons.delete_outline, color: c.textDim, size: 18),
                splashRadius: 18,
                tooltip: 'Sil',
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTableFooter(AppColors c, OrdersState state) {
    final startItem = state.payments.isEmpty ? 0 : ((state.page - 1) * 20) + 1;
    final endItem = startItem + state.payments.length - 1;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: c.cardBorder)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Gosterilen $startItem-$endItem / ${state.totalCount} sonuc',
            style: AppTextStyles.bodySmall(c),
          ),
          Text(
            'Toplam: ${_currencyFormat.format(state.totalRevenue)}',
            style: AppTextStyles.tableCellBold(c).copyWith(
              color: AppColors.green,
            ),
          ),
        ],
      ),
    );
  }

  // ────────────────────────── Helpers ──────────────────────────

  Color _paymentMethodColor(int method) => switch (method) {
        1 => AppColors.green,          // Nakit
        2 => AppColors.primary,        // Kredi Karti
        3 => AppColors.accent,         // Havale
        4 => AppColors.orange,         // Cek
        5 => const Color(0xFF8b5cf6),  // Diger
        _ => const Color(0xFF8b5cf6),
      };

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return parts.first.isNotEmpty ? parts.first[0].toUpperCase() : '?';
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd.MM.yyyy HH:mm').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  Future<void> _confirmDelete(PaymentListItem payment) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        final c = AppColors.of(ctx);
        return AlertDialog(
          backgroundColor: c.cardBg,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('Odemeyi Sil', style: AppTextStyles.heading3(c)),
          content: Text(
            '${payment.customerFullName} - ${payment.treatmentName} odemesini silmek istediginize emin misiniz?',
            style: AppTextStyles.body(c),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text('Iptal', style: TextStyle(color: c.textMuted)),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Sil', style: TextStyle(color: AppColors.red)),
            ),
          ],
        );
      },
    );

    if (confirmed == true && mounted) {
      context.read<OrdersCubit>().deletePayment(payment.id);
    }
  }
}

// ────────────────────────── Private Widgets ──────────────────────────

class _ExportButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ExportButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: c.cardBg,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(color: c.cardBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 6),
              Text(
                label,
                style: AppTextStyles.body(c).copyWith(fontSize: 13),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DateFilterButton extends StatelessWidget {
  final AppColors c;
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _DateFilterButton({
    required this.c,
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        onTap: onTap,
        child: Container(
          height: 40,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: c.inputBg,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(color: c.inputBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: c.textDim, size: 16),
              const SizedBox(width: 8),
              Text(label, style: TextStyle(color: c.textDim, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }
}
