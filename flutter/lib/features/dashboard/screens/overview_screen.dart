import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/dashboard_models.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/widgets/responsive_builder.dart';
import 'package:intl/intl.dart';

const _chartColors = [Color(0xFFec4899), Color(0xFF8b5cf6), Color(0xFF06b6d4), Color(0xFF10b981), Color(0xFFf59e0b)];

class OverviewScreen extends StatefulWidget {
  const OverviewScreen({super.key});

  @override
  State<OverviewScreen> createState() => _OverviewScreenState();
}

class _OverviewScreenState extends State<OverviewScreen> {
  final _api = ApiService();
  DashboardSummary? _data;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final res = await _api.get('/dashboard/summary',
        fromData: (d) => DashboardSummary.fromJson(d));
    if (mounted) setState(() { _data = res.data; _loading = false; });
  }

  String _formatNumber(double n) {
    if (n.abs() >= 1000) return NumberFormat('#,##0', 'tr_TR').format(n);
    return n.toStringAsFixed(0);
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    if (_loading) return Center(child: CircularProgressIndicator(color: AppColors.primary));
    final data = _data;
    if (data == null) return Center(child: Text('Veri yüklenemedi', style: TextStyle(color: c.textDim)));

    final isDesktop = ResponsiveBuilder.isDesktop(context);
    final user = context.read<AuthProvider>().user;
    final now = DateTime.now();
    final dateStr = DateFormat('d MMMM yyyy EEEE', 'tr_TR').format(now);

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.all(isDesktop ? 28 : 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Tekrar hoş geldiniz,',
                          style: TextStyle(color: c.textMuted, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text(user?.fullName ?? '', style: TextStyle(
                          color: c.textPrimary, fontSize: 28, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                Text(dateStr, style: TextStyle(color: c.textDim, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 24),

            // -- KPI Cards --
            _buildKpiRow(data, isDesktop, c),
            const SizedBox(height: 16),

            // -- Net Kar Bar --
            _buildNetProfitBar(data, c),
            const SizedBox(height: 16),

            // -- Gelir Gider Trendi + Randevu Durumu --
            isDesktop
                ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(flex: 3, child: _buildRevenueChart(data, c)),
                    const SizedBox(width: 16),
                    Expanded(flex: 1, child: _buildStatusDonut(data, c)),
                  ])
                : Column(children: [
                    _buildRevenueChart(data, c),
                    const SizedBox(height: 16),
                    _buildStatusDonut(data, c),
                  ]),
            const SizedBox(height: 16),

            // -- Musteri Buyumesi + Top Hizmetler --
            isDesktop
                ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(flex: 2, child: _buildCustomerGrowthChart(data, c)),
                    const SizedBox(width: 16),
                    Expanded(flex: 1, child: _buildTopServicesChart(data, c)),
                  ])
                : Column(children: [
                    _buildCustomerGrowthChart(data, c),
                    const SizedBox(height: 16),
                    _buildTopServicesChart(data, c),
                  ]),
            const SizedBox(height: 16),

            // -- Bugunun Programi --
            _buildScheduleTable(data, c),
            const SizedBox(height: 16),

            // -- Top Personel --
            _buildTopStaff(data, c),
          ],
        ),
      ),
    );
  }

  // -- KPI CARDS --
  Widget _buildKpiRow(DashboardSummary data, bool isDesktop, AppColors c) {
    final cards = [
      _KpiData('BUGÜNÜN RANDEVULARI', '${data.todayAppointmentsCount}',
          sub: '${data.upcomingAppointments} yaklaşan', icon: Icons.calendar_today_rounded),
      _KpiData('BU AY GELİR', '${_formatNumber(data.thisMonthRevenue)} \u20BA',
          subValue: 'Bu Hafta: ${_formatNumber(data.thisWeekRevenue)} \u20BA',
          icon: Icons.attach_money_rounded, gradient: true),
      _KpiData('TOPLAM MÜŞTERİ', '${data.totalCustomers}', icon: Icons.people_alt_rounded),
      _KpiData('AKTİF PAKETLER', '${data.activePackages}', icon: Icons.inventory_2_rounded),
    ];

    if (isDesktop) {
      return IntrinsicHeight(
        child: Row(children: cards.asMap().entries.map((e) {
          return Expanded(child: Padding(
            padding: EdgeInsets.only(left: e.key > 0 ? 12 : 0),
            child: _buildKpiCard(e.value, c),
          ));
        }).toList()),
      );
    }
    return Wrap(spacing: 12, runSpacing: 12,
        children: cards.map((card) => SizedBox(width: (MediaQuery.of(context).size.width - 60) / 2,
            child: _buildKpiCard(card, c))).toList());
  }

  Widget _buildKpiCard(_KpiData d, AppColors c) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: c.cardBg, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(child: Text(d.label, style: TextStyle(
                  color: c.textDim, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1))),
              Icon(d.icon, color: c.textDim, size: 20),
            ],
          ),
          const SizedBox(height: 12),
          d.gradient
              ? ShaderMask(
                  shaderCallback: (b) => const LinearGradient(
                      colors: [AppColors.primary, AppColors.accent]).createShader(b),
                  child: Text(d.value, style: const TextStyle(
                      fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
                )
              : Text(d.value, style: TextStyle(
                  fontSize: 28, fontWeight: FontWeight.bold, color: c.textPrimary)),
          if (d.sub != null) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: c.navActive, borderRadius: BorderRadius.circular(8)),
              child: Text(d.sub!, style: const TextStyle(color: AppColors.accent, fontSize: 11)),
            ),
          ],
          if (d.subValue != null)
            Padding(padding: const EdgeInsets.only(top: 6),
                child: Text(d.subValue!, style: TextStyle(color: c.textDim, fontSize: 11))),
        ],
      ),
    );
  }

  // -- NET KAR BAR --
  Widget _buildNetProfitBar(DashboardSummary data, AppColors c) {
    final isPositive = data.netProfit >= 0;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: c.cardBg,
        border: Border.all(color: c.cardBorder),
      ),
      child: Row(
        children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('NET KAR (Bu Ay)', style: TextStyle(color: c.textDim, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1)),
            const SizedBox(height: 4),
            Text('${_formatNumber(data.netProfit)} \u20BA', style: TextStyle(
                color: isPositive ? AppColors.green : AppColors.red,
                fontSize: 24, fontWeight: FontWeight.bold)),
          ]),
          const Spacer(),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Row(children: [
              Text('Gelir  ', style: TextStyle(color: c.textDim, fontSize: 11)),
              Text('${_formatNumber(data.thisMonthRevenue)} \u20BA',
                  style: const TextStyle(color: AppColors.green, fontSize: 13, fontWeight: FontWeight.w600)),
            ]),
            const SizedBox(height: 4),
            Row(children: [
              Text('Gider  ', style: TextStyle(color: c.textDim, fontSize: 11)),
              Text('${_formatNumber(data.thisMonthExpense)} \u20BA',
                  style: const TextStyle(color: AppColors.red, fontSize: 13, fontWeight: FontWeight.w600)),
            ]),
          ]),
        ],
      ),
    );
  }

  // -- GELIR & GIDER TREND CHART --
  Widget _buildRevenueChart(DashboardSummary data, AppColors c) {
    return _card(
      c: c,
      title: 'GELIR & GIDER TRENDI',
      height: 320,
      child: data.monthlyTrend.isEmpty
          ? Center(child: Text('Veri yok', style: TextStyle(color: c.textDim)))
          : LineChart(LineChartData(
              gridData: FlGridData(
                show: true, drawVerticalLine: true,
                getDrawingHorizontalLine: (_) => FlLine(color: c.cardBorder, strokeWidth: 0.5),
                getDrawingVerticalLine: (_) => FlLine(color: c.cardBorder, strokeWidth: 0.5),
              ),
              titlesData: FlTitlesData(
                bottomTitles: AxisTitles(sideTitles: SideTitles(
                  showTitles: true, reservedSize: 30,
                  getTitlesWidget: (value, _) {
                    final i = value.toInt();
                    if (i < data.monthlyTrend.length) {
                      return Padding(padding: const EdgeInsets.only(top: 8),
                          child: Text(data.monthlyTrend[i].month,
                              style: TextStyle(color: c.textDim, fontSize: 10)));
                    }
                    return const SizedBox.shrink();
                  },
                )),
                leftTitles: AxisTitles(sideTitles: SideTitles(
                  showTitles: true, reservedSize: 45,
                  getTitlesWidget: (value, _) {
                    if (value == 0) return Text('0k', style: TextStyle(color: c.textDim, fontSize: 10));
                    return Text('${(value / 1000).toStringAsFixed(0)}k',
                        style: TextStyle(color: c.textDim, fontSize: 10));
                  },
                )),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              borderData: FlBorderData(show: false),
              lineBarsData: [
                LineChartBarData(
                  spots: data.monthlyTrend.asMap().entries.map(
                      (e) => FlSpot(e.key.toDouble(), e.value.expense)).toList(),
                  color: AppColors.accent, barWidth: 2, dotData: FlDotData(show: true),
                  belowBarData: BarAreaData(show: false),
                ),
                LineChartBarData(
                  spots: data.monthlyTrend.asMap().entries.map(
                      (e) => FlSpot(e.key.toDouble(), e.value.revenue)).toList(),
                  color: AppColors.primary, barWidth: 2, dotData: FlDotData(show: true),
                  belowBarData: BarAreaData(show: false),
                ),
              ],
            )),
    );
  }

  // -- RANDEVU DURUMU DONUT --
  Widget _buildStatusDonut(DashboardSummary data, AppColors c) {
    final sd = data.statusDistribution;
    if (sd == null || sd.total == 0) {
      return _card(c: c, title: 'RANDEVU DURUMU', height: 320,
          child: Center(child: Text('Veri yok', style: TextStyle(color: c.textDim))));
    }

    final sections = <_StatusEntry>[
      _StatusEntry('Gelmedi', sd.noShow, const Color(0xFFf59e0b)),
      _StatusEntry('Onaylandi', sd.confirmed, const Color(0xFF10b981)),
      _StatusEntry('Planlandi', sd.scheduled, const Color(0xFF3b82f6)),
      _StatusEntry('Tamamlandi', sd.completed, const Color(0xFF06b6d4)),
      _StatusEntry('Iptal', sd.cancelled, const Color(0xFFef4444)),
    ].where((e) => e.value > 0).toList();

    return _card(
      c: c,
      title: 'RANDEVU DURUMU',
      height: 320,
      child: Column(
        children: [
          SizedBox(
            height: 200,
            child: PieChart(PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 50,
              sections: sections.map((e) => PieChartSectionData(
                value: e.value.toDouble(), color: e.color,
                radius: 40, showTitle: false,
              )).toList(),
            )),
          ),
          const SizedBox(height: 16),
          Wrap(spacing: 12, runSpacing: 6,
            children: sections.map((e) => Row(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 10, height: 10, decoration: BoxDecoration(
                  color: e.color, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 4),
              Text(e.label, style: TextStyle(color: c.textDim, fontSize: 10)),
            ])).toList(),
          ),
        ],
      ),
    );
  }

  // -- MÜŞTERİ BÜYÜMESİ --
  Widget _buildCustomerGrowthChart(DashboardSummary data, AppColors c) {
    if (data.customerGrowth.isEmpty) {
      return _card(c: c, title: 'MÜŞTERİ BÜYÜMESİ', height: 320,
          child: Center(child: Text('Veri yok', style: TextStyle(color: c.textDim))));
    }
    return _card(
      c: c,
      title: 'MÜŞTERİ BÜYÜMESİ',
      height: 320,
      child: BarChart(BarChartData(
        barGroups: data.customerGrowth.asMap().entries.map((e) {
          return BarChartGroupData(x: e.key, barRods: [
            BarChartRodData(toY: e.value.totalCustomers.toDouble(), color: AppColors.primary.withValues(alpha: 0.5),
                width: 16, borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
            BarChartRodData(toY: e.value.newCustomers.toDouble(), color: AppColors.accent,
                width: 16, borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
          ]);
        }).toList(),
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(sideTitles: SideTitles(
            showTitles: true, reservedSize: 30,
            getTitlesWidget: (value, _) {
              final i = value.toInt();
              if (i < data.customerGrowth.length) {
                return Padding(padding: const EdgeInsets.only(top: 8),
                    child: Text(data.customerGrowth[i].month,
                        style: TextStyle(color: c.textDim, fontSize: 10)));
              }
              return const SizedBox.shrink();
            },
          )),
          leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 30,
              getTitlesWidget: (v, _) => Text('${v.toInt()}', style: TextStyle(color: c.textDim, fontSize: 10)))),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
      )),
    );
  }

  // -- TOP HIZMETLER --
  Widget _buildTopServicesChart(DashboardSummary data, AppColors c) {
    if (data.topServices.isEmpty) {
      return _card(c: c, title: 'GELİRE GÖRE EN İYİ HİZMETLER', height: 320,
          child: Center(child: Text('Veri yok', style: TextStyle(color: c.textDim))));
    }
    final max = data.topServices.map((e) => e.amountInTry).reduce((a, b) => a > b ? a : b);
    return _card(
      c: c,
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
            child: Row(
              children: [
                SizedBox(width: 80, child: Text(s.label,
                    style: TextStyle(color: c.textMuted, fontSize: 11),
                    overflow: TextOverflow.ellipsis)),
                const SizedBox(width: 8),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: ratio, minHeight: 20,
                      backgroundColor: c.cardBorder, color: color,
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // -- BUGÜNÜN PROGRAMI TABLE --
  Widget _buildScheduleTable(DashboardSummary data, AppColors c) {
    return _card(
      c: c,
      title: 'BUGÜNÜN PROGRAMI',
      child: data.todaySchedule.isEmpty
          ? Padding(padding: const EdgeInsets.all(20),
              child: Text('Bugün randevu yok', style: TextStyle(color: c.textDim)))
          : Column(children: [
              // Table header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.cardBorder))),
                child: Row(children: [
                  SizedBox(width: 140, child: Text('SAAT', style: TextStyle(color: c.textDim, fontSize: 10, fontWeight: FontWeight.w600))),
                  Expanded(flex: 2, child: Text('MUSTERI', style: TextStyle(color: c.textDim, fontSize: 10, fontWeight: FontWeight.w600))),
                  Expanded(flex: 2, child: Text('HIZMET', style: TextStyle(color: c.textDim, fontSize: 10, fontWeight: FontWeight.w600))),
                  Expanded(flex: 2, child: Text('PERSONEL', style: TextStyle(color: c.textDim, fontSize: 10, fontWeight: FontWeight.w600))),
                  SizedBox(width: 100, child: Text('DURUM', style: TextStyle(color: c.textDim, fontSize: 10, fontWeight: FontWeight.w600))),
                ]),
              ),
              // Table rows
              ...data.todaySchedule.map((a) {
                final statusColor = _statusColor(a.status);
                final statusLabel = _statusLabel(a.status);
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.cardBorder))),
                  child: Row(children: [
                    SizedBox(width: 140, child: Text(a.time, style: TextStyle(color: c.textPrimary, fontSize: 13))),
                    Expanded(flex: 2, child: Text(a.customerName, style: TextStyle(color: c.textPrimary, fontSize: 13, fontWeight: FontWeight.w500))),
                    Expanded(flex: 2, child: Row(children: [
                      Container(width: 8, height: 8, margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.accent)),
                      Flexible(child: Text(a.treatmentName, style: TextStyle(color: c.textPrimary, fontSize: 13))),
                    ])),
                    Expanded(flex: 2, child: Text(a.staffName, style: TextStyle(color: c.textPrimary, fontSize: 13))),
                    SizedBox(width: 100, child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                      ),
                      child: Text(statusLabel, textAlign: TextAlign.center,
                          style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w600)),
                    )),
                  ]),
                );
              }),
            ]),
    );
  }

  // -- TOP PERSONEL --
  Widget _buildTopStaff(DashboardSummary data, AppColors c) {
    if (data.topStaff.isEmpty) return const SizedBox.shrink();
    final max = data.topStaff.map((e) => e.amountInTry).reduce((a, b) => a > b ? a : b);
    final colors = [AppColors.accent, AppColors.cyan, AppColors.green, AppColors.primary, AppColors.orange];

    return _card(
      c: c,
      title: 'GELİRE GÖRE EN İYİ PERSONEL',
      child: Column(
        children: data.topStaff.asMap().entries.map((e) {
          final s = e.value;
          final color = colors[e.key % colors.length];
          final ratio = max > 0 ? s.amountInTry / max : 0.0;
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 20),
            child: Row(children: [
              Container(width: 28, height: 28,
                  decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(8)),
                  child: Center(child: Text('${e.key + 1}', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)))),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(s.label, style: TextStyle(color: c.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 4),
                  ClipRRect(borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(value: ratio, minHeight: 6,
                          backgroundColor: c.cardBorder, color: color)),
                ]),
              ),
              const SizedBox(width: 12),
              Text('${_formatNumber(s.amountInTry)} \u20BA',
                  style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w600)),
            ]),
          );
        }).toList(),
      ),
    );
  }

  // -- HELPERS --
  Widget _card({required AppColors c, required String title, double? height, required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: c.cardBg, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: c.cardBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
            child: Text(title, style: TextStyle(
                color: c.textDim, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.5))),
        if (height != null)
          SizedBox(height: height, child: Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: child))
        else
          child,
      ]),
    );
  }

  Color _statusColor(String s) => switch (s) {
    'Scheduled' => const Color(0xFF3b82f6),
    'Confirmed' => AppColors.green,
    'Completed' => AppColors.cyan,
    'Cancelled' => AppColors.red,
    'NoShow' => AppColors.orange,
    _ => AppColors.of(context).textDim,
  };

  String _statusLabel(String s) => switch (s) {
    'Scheduled' => 'Planlandi',
    'Confirmed' => 'Onaylandi',
    'Completed' => 'Tamamlandi',
    'Cancelled' => 'Iptal',
    'NoShow' => 'Gelmedi',
    _ => s,
  };
}

class _KpiData {
  final String label, value;
  final String? sub, subValue;
  final IconData icon;
  final bool gradient;
  _KpiData(this.label, this.value, {this.sub, this.subValue, required this.icon, this.gradient = false});
}

class _StatusEntry {
  final String label;
  final int value;
  final Color color;
  _StatusEntry(this.label, this.value, this.color);
}
