import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../../../core/bloc/auth/auth_cubit.dart';
import '../../../core/bloc/auth/auth_state.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/models/dashboard_models.dart';
import '../../../core/widgets/responsive_builder.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_loading.dart';
import '../../../core/widgets/app_status_badge.dart';
import '../../../core/widgets/app_avatar.dart';
import '../bloc/dashboard_cubit.dart';
import '../bloc/dashboard_state.dart';

const _chartColors = [
  Color(0xFFec4899),
  Color(0xFF8b5cf6),
  Color(0xFF06b6d4),
  Color(0xFF10b981),
  Color(0xFFf59e0b),
];

class OverviewScreen extends StatefulWidget {
  const OverviewScreen({super.key});

  @override
  State<OverviewScreen> createState() => _OverviewScreenState();
}

class _OverviewScreenState extends State<OverviewScreen> {
  @override
  void initState() {
    super.initState();
    context.read<DashboardCubit>().load();
  }

  String _fmt(double n) {
    if (n.abs() >= 1000) return NumberFormat('#,##0', 'tr_TR').format(n);
    return n.toStringAsFixed(0);
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DashboardCubit, DashboardState>(
      builder: (context, state) {
        if (state.status == DashboardStatus.loading ||
            state.status == DashboardStatus.initial) {
          return const AppLoading();
        }
        if (state.status == DashboardStatus.error || state.data == null) {
          return AppErrorState(
            message: state.error ?? 'Veri yüklenemedi',
            onRetry: () => context.read<DashboardCubit>().refresh(),
          );
        }
        return _DashboardContent(data: state.data!, fmt: _fmt);
      },
    );
  }
}

/// Dashboard içeriği - data değişmedikçe rebuild olmaz
class _DashboardContent extends StatelessWidget {
  final DashboardSummary data;
  final String Function(double) fmt;

  const _DashboardContent({required this.data, required this.fmt});

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveBuilder.isDesktop(context);
    final now = DateTime.now();
    final dateStr = DateFormat('d MMMM yyyy EEEE', 'tr_TR').format(now);

    return RefreshIndicator(
      onRefresh: () => context.read<DashboardCubit>().refresh(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: AppSpacing.screenPadding(isDesktop),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _WelcomeHeader(dateStr: dateStr),
            AppSpacing.verticalXxl,
            _KpiRow(data: data, isDesktop: isDesktop, fmt: fmt),
            AppSpacing.verticalLg,
            _NetProfitBar(data: data, fmt: fmt),
            AppSpacing.verticalLg,
            _ChartsRow1(data: data, isDesktop: isDesktop),
            AppSpacing.verticalLg,
            _ChartsRow2(data: data, isDesktop: isDesktop),
            AppSpacing.verticalLg,
            _ScheduleTable(data: data),
            AppSpacing.verticalLg,
            _TopStaff(data: data, fmt: fmt),
          ],
        ),
      ),
    );
  }
}

/// Hoş geldin başlığı - sadece user değiştiğinde rebuild
class _WelcomeHeader extends StatelessWidget {
  final String dateStr;
  const _WelcomeHeader({required this.dateStr});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Tekrar hoş geldiniz,', style: AppTextStyles.bodyMuted(c)),
              AppSpacing.verticalXs,
              BlocSelector<AuthCubit, AuthState, String>(
                selector: (state) => state.user?.fullName ?? '',
                builder: (context, name) =>
                    Text(name, style: AppTextStyles.heading1(c)),
              ),
            ],
          ),
        ),
        Text(dateStr, style: AppTextStyles.bodySmall(c)),
      ],
    );
  }
}

/// KPI Kartları
class _KpiRow extends StatelessWidget {
  final DashboardSummary data;
  final bool isDesktop;
  final String Function(double) fmt;

  const _KpiRow({required this.data, required this.isDesktop, required this.fmt});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final cards = [
      _KpiData('BUGÜNÜN RANDEVULARI', '${data.todayAppointmentsCount}',
          sub: '${data.upcomingAppointments} yaklaşan',
          icon: Icons.calendar_today_rounded),
      _KpiData('BU AY GELİR', '${fmt(data.thisMonthRevenue)} \u20BA',
          subValue: 'Bu Hafta: ${fmt(data.thisWeekRevenue)} \u20BA',
          icon: Icons.attach_money_rounded,
          gradient: true),
      _KpiData('TOPLAM MÜŞTERİ', '${data.totalCustomers}',
          icon: Icons.people_alt_rounded),
      _KpiData('AKTİF PAKETLER', '${data.activePackages}',
          icon: Icons.inventory_2_rounded),
    ];

    if (isDesktop) {
      return IntrinsicHeight(
        child: Row(
          children: cards.asMap().entries.map((e) {
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(left: e.key > 0 ? 12 : 0),
                child: _KpiCard(d: e.value, c: c),
              ),
            );
          }).toList(),
        ),
      );
    }
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: cards
          .map((card) => SizedBox(
                width: (MediaQuery.of(context).size.width - 60) / 2,
                child: _KpiCard(d: card, c: c),
              ))
          .toList(),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final _KpiData d;
  final AppColors c;
  const _KpiCard({required this.d, required this.c});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppSpacing.paddingXl,
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(child: Text(d.label, style: AppTextStyles.label(c))),
              Icon(d.icon, color: c.textDim, size: 20),
            ],
          ),
          AppSpacing.verticalMd,
          d.gradient
              ? ShaderMask(
                  shaderCallback: (b) => const LinearGradient(
                          colors: [AppColors.primary, AppColors.accent])
                      .createShader(b),
                  child: Text(d.value,
                      style: AppTextStyles.kpiValue(c)
                          .copyWith(color: Colors.white)),
                )
              : Text(d.value, style: AppTextStyles.kpiValue(c)),
          if (d.sub != null) ...[
            AppSpacing.verticalSm,
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                  color: c.navActive,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm)),
              child: Text(d.sub!,
                  style: const TextStyle(color: AppColors.accent, fontSize: 11)),
            ),
          ],
          if (d.subValue != null)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(d.subValue!, style: AppTextStyles.bodySmallMuted(c)),
            ),
        ],
      ),
    );
  }
}

/// Net kar barı
class _NetProfitBar extends StatelessWidget {
  final DashboardSummary data;
  final String Function(double) fmt;
  const _NetProfitBar({required this.data, required this.fmt});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final isPositive = data.netProfit >= 0;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        color: c.cardBg,
        border: Border.all(color: c.cardBorder),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('NET KAR (Bu Ay)', style: AppTextStyles.label(c)),
              AppSpacing.verticalXs,
              Text('${fmt(data.netProfit)} \u20BA',
                  style: TextStyle(
                      color: isPositive ? AppColors.green : AppColors.red,
                      fontSize: 24,
                      fontWeight: FontWeight.bold)),
            ],
          ),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(children: [
                Text('Gelir  ', style: AppTextStyles.bodySmallMuted(c)),
                Text('${fmt(data.thisMonthRevenue)} \u20BA',
                    style: const TextStyle(
                        color: AppColors.green,
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
              ]),
              AppSpacing.verticalXs,
              Row(children: [
                Text('Gider  ', style: AppTextStyles.bodySmallMuted(c)),
                Text('${fmt(data.thisMonthExpense)} \u20BA',
                    style: const TextStyle(
                        color: AppColors.red,
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
              ]),
            ],
          ),
        ],
      ),
    );
  }
}

/// Gelir/Gider trendi + Randevu durumu
class _ChartsRow1 extends StatelessWidget {
  final DashboardSummary data;
  final bool isDesktop;
  const _ChartsRow1({required this.data, required this.isDesktop});

  @override
  Widget build(BuildContext context) {
    if (isDesktop) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 3, child: _RevenueChart(data: data)),
          AppSpacing.horizontalLg,
          Expanded(flex: 1, child: _StatusDonut(data: data)),
        ],
      );
    }
    return Column(children: [
      _RevenueChart(data: data),
      AppSpacing.verticalLg,
      _StatusDonut(data: data),
    ]);
  }
}

/// Müşteri büyümesi + Top hizmetler
class _ChartsRow2 extends StatelessWidget {
  final DashboardSummary data;
  final bool isDesktop;
  const _ChartsRow2({required this.data, required this.isDesktop});

  @override
  Widget build(BuildContext context) {
    if (isDesktop) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 2, child: _CustomerGrowthChart(data: data)),
          AppSpacing.horizontalLg,
          Expanded(flex: 1, child: _TopServicesChart(data: data)),
        ],
      );
    }
    return Column(children: [
      _CustomerGrowthChart(data: data),
      AppSpacing.verticalLg,
      _TopServicesChart(data: data),
    ]);
  }
}

class _RevenueChart extends StatelessWidget {
  final DashboardSummary data;
  const _RevenueChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return AppCard(
      title: 'GELIR & GIDER TRENDI',
      height: 320,
      child: data.monthlyTrend.isEmpty
          ? AppEmptyState(message: 'Veri yok')
          : LineChart(LineChartData(
              gridData: FlGridData(
                show: true,
                drawVerticalLine: true,
                getDrawingHorizontalLine: (_) =>
                    FlLine(color: c.cardBorder, strokeWidth: 0.5),
                getDrawingVerticalLine: (_) =>
                    FlLine(color: c.cardBorder, strokeWidth: 0.5),
              ),
              titlesData: FlTitlesData(
                bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 30,
                  getTitlesWidget: (value, _) {
                    final i = value.toInt();
                    if (i < data.monthlyTrend.length) {
                      return Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(data.monthlyTrend[i].month,
                              style: TextStyle(
                                  color: c.textDim, fontSize: 10)));
                    }
                    return const SizedBox.shrink();
                  },
                )),
                leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 45,
                  getTitlesWidget: (value, _) {
                    if (value == 0) {
                      return Text('0k',
                          style: TextStyle(color: c.textDim, fontSize: 10));
                    }
                    return Text('${(value / 1000).toStringAsFixed(0)}k',
                        style: TextStyle(color: c.textDim, fontSize: 10));
                  },
                )),
                topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false)),
                rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false)),
              ),
              borderData: FlBorderData(show: false),
              lineBarsData: [
                LineChartBarData(
                  spots: data.monthlyTrend
                      .asMap()
                      .entries
                      .map((e) =>
                          FlSpot(e.key.toDouble(), e.value.expense))
                      .toList(),
                  color: AppColors.accent,
                  barWidth: 2,
                  dotData: FlDotData(show: true),
                  belowBarData: BarAreaData(show: false),
                ),
                LineChartBarData(
                  spots: data.monthlyTrend
                      .asMap()
                      .entries
                      .map((e) =>
                          FlSpot(e.key.toDouble(), e.value.revenue))
                      .toList(),
                  color: AppColors.primary,
                  barWidth: 2,
                  dotData: FlDotData(show: true),
                  belowBarData: BarAreaData(show: false),
                ),
              ],
            )),
    );
  }
}

class _StatusDonut extends StatelessWidget {
  final DashboardSummary data;
  const _StatusDonut({required this.data});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final sd = data.statusDistribution;
    if (sd == null || sd.total == 0) {
      return AppCard(
        title: 'RANDEVU DURUMU',
        height: 320,
        child: AppEmptyState(message: 'Veri yok'),
      );
    }

    final sections = <_StatusEntry>[
      _StatusEntry('Gelmedi', sd.noShow, const Color(0xFFf59e0b)),
      _StatusEntry('Onaylandi', sd.confirmed, const Color(0xFF10b981)),
      _StatusEntry('Planlandi', sd.scheduled, const Color(0xFF3b82f6)),
      _StatusEntry('Tamamlandi', sd.completed, const Color(0xFF06b6d4)),
      _StatusEntry('Iptal', sd.cancelled, const Color(0xFFef4444)),
    ].where((e) => e.value > 0).toList();

    return AppCard(
      title: 'RANDEVU DURUMU',
      height: 320,
      child: Column(
        children: [
          SizedBox(
            height: 200,
            child: PieChart(PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 50,
              sections: sections
                  .map((e) => PieChartSectionData(
                        value: e.value.toDouble(),
                        color: e.color,
                        radius: 40,
                        showTitle: false,
                      ))
                  .toList(),
            )),
          ),
          AppSpacing.verticalLg,
          Wrap(
            spacing: 12,
            runSpacing: 6,
            children: sections
                .map((e) => Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                                color: e.color,
                                borderRadius: BorderRadius.circular(2))),
                        AppSpacing.horizontalXs,
                        Text(e.label,
                            style: TextStyle(
                                color: c.textDim, fontSize: 10)),
                      ],
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _CustomerGrowthChart extends StatelessWidget {
  final DashboardSummary data;
  const _CustomerGrowthChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    if (data.customerGrowth.isEmpty) {
      return AppCard(
          title: 'MÜŞTERİ BÜYÜMESİ',
          height: 320,
          child: AppEmptyState(message: 'Veri yok'));
    }
    return AppCard(
      title: 'MÜŞTERİ BÜYÜMESİ',
      height: 320,
      child: BarChart(BarChartData(
        barGroups: data.customerGrowth.asMap().entries.map((e) {
          return BarChartGroupData(x: e.key, barRods: [
            BarChartRodData(
                toY: e.value.totalCustomers.toDouble(),
                color: AppColors.primary.withValues(alpha: 0.5),
                width: 16,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(4))),
            BarChartRodData(
                toY: e.value.newCustomers.toDouble(),
                color: AppColors.accent,
                width: 16,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(4))),
          ]);
        }).toList(),
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(
              sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 30,
            getTitlesWidget: (value, _) {
              final i = value.toInt();
              if (i < data.customerGrowth.length) {
                return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(data.customerGrowth[i].month,
                        style: TextStyle(color: c.textDim, fontSize: 10)));
              }
              return const SizedBox.shrink();
            },
          )),
          leftTitles: AxisTitles(
              sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 30,
            getTitlesWidget: (v, _) => Text('${v.toInt()}',
                style: TextStyle(color: c.textDim, fontSize: 10)),
          )),
          topTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
      )),
    );
  }
}

class _TopServicesChart extends StatelessWidget {
  final DashboardSummary data;
  const _TopServicesChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    if (data.topServices.isEmpty) {
      return AppCard(
          title: 'GELİRE GÖRE EN İYİ HİZMETLER',
          height: 320,
          child: AppEmptyState(message: 'Veri yok'));
    }
    final max = data.topServices
        .map((e) => e.amountInTry)
        .reduce((a, b) => a > b ? a : b);
    return AppCard(
      title: 'GELİRE GÖRE EN İYİ HİZMETLER',
      height: 320,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: data.topServices.asMap().entries.map((e) {
          final s = e.value;
          final color = _chartColors[e.key % _chartColors.length];
          final ratio = max > 0 ? s.amountInTry / max : 0.0;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(children: [
              SizedBox(
                  width: 80,
                  child: Text(s.label,
                      style: AppTextStyles.bodySmallMuted(c),
                      overflow: TextOverflow.ellipsis)),
              AppSpacing.horizontalSm,
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: ratio,
                    minHeight: 20,
                    backgroundColor: c.cardBorder,
                    color: color,
                  ),
                ),
              ),
            ]),
          );
        }).toList(),
      ),
    );
  }
}

class _ScheduleTable extends StatelessWidget {
  final DashboardSummary data;
  const _ScheduleTable({required this.data});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    return AppCard(
      title: 'BUGÜNÜN PROGRAMI',
      child: data.todaySchedule.isEmpty
          ? Padding(
              padding: AppSpacing.paddingXl,
              child: Text('Bugün randevu yok',
                  style: AppTextStyles.bodySmall(c)))
          : Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                      border: Border(
                          bottom: BorderSide(color: c.cardBorder))),
                  child: Row(children: [
                    SizedBox(
                        width: 140,
                        child: Text('SAAT',
                            style: AppTextStyles.tableHeader(c))),
                    Expanded(
                        flex: 2,
                        child: Text('MUSTERI',
                            style: AppTextStyles.tableHeader(c))),
                    Expanded(
                        flex: 2,
                        child: Text('HIZMET',
                            style: AppTextStyles.tableHeader(c))),
                    Expanded(
                        flex: 2,
                        child: Text('PERSONEL',
                            style: AppTextStyles.tableHeader(c))),
                    SizedBox(
                        width: 100,
                        child: Text('DURUM',
                            style: AppTextStyles.tableHeader(c))),
                  ]),
                ),
                ...data.todaySchedule.map((a) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 14),
                    decoration: BoxDecoration(
                        border: Border(
                            bottom: BorderSide(color: c.cardBorder))),
                    child: Row(children: [
                      SizedBox(
                          width: 140,
                          child: Text(a.time,
                              style: AppTextStyles.tableCell(c))),
                      Expanded(
                          flex: 2,
                          child: Text(a.customerName,
                              style: AppTextStyles.tableCellBold(c))),
                      Expanded(
                          flex: 2,
                          child: Row(children: [
                            Container(
                                width: 8,
                                height: 8,
                                margin: const EdgeInsets.only(right: 8),
                                decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: AppColors.accent)),
                            Flexible(
                                child: Text(a.treatmentName,
                                    style:
                                        AppTextStyles.tableCell(c))),
                          ])),
                      Expanded(
                          flex: 2,
                          child: Text(a.staffName,
                              style: AppTextStyles.tableCell(c))),
                      SizedBox(
                        width: 100,
                        child: AppStatusBadge.appointment(a.status),
                      ),
                    ]),
                  );
                }),
              ],
            ),
    );
  }
}

class _TopStaff extends StatelessWidget {
  final DashboardSummary data;
  final String Function(double) fmt;
  const _TopStaff({required this.data, required this.fmt});

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    if (data.topStaff.isEmpty) return const SizedBox.shrink();
    final max = data.topStaff
        .map((e) => e.amountInTry)
        .reduce((a, b) => a > b ? a : b);
    final colors = [
      AppColors.accent,
      AppColors.cyan,
      AppColors.green,
      AppColors.primary,
      AppColors.orange,
    ];

    return AppCard(
      title: 'GELİRE GÖRE EN İYİ PERSONEL',
      child: Column(
        children: data.topStaff.asMap().entries.map((e) {
          final s = e.value;
          final color = colors[e.key % colors.length];
          final ratio = max > 0 ? s.amountInTry / max : 0.0;
          return Padding(
            padding:
                const EdgeInsets.symmetric(vertical: 8, horizontal: 20),
            child: Row(children: [
              AppRankAvatar(rank: e.key + 1, color: color),
              AppSpacing.horizontalMd,
              Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(s.label,
                          style: AppTextStyles.tableCellBold(c)),
                      AppSpacing.verticalXs,
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                            value: ratio,
                            minHeight: 6,
                            backgroundColor: c.cardBorder,
                            color: color),
                      ),
                    ]),
              ),
              AppSpacing.horizontalMd,
              Text('${fmt(s.amountInTry)} \u20BA',
                  style: TextStyle(
                      color: color,
                      fontSize: 13,
                      fontWeight: FontWeight.w600)),
            ]),
          );
        }).toList(),
      ),
    );
  }
}

class _KpiData {
  final String label, value;
  final String? sub, subValue;
  final IconData icon;
  final bool gradient;
  _KpiData(this.label, this.value,
      {this.sub, this.subValue, required this.icon, this.gradient = false});
}

class _StatusEntry {
  final String label;
  final int value;
  final Color color;
  _StatusEntry(this.label, this.value, this.color);
}
