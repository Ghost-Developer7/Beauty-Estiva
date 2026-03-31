import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/dashboard_models.dart';
import '../../../core/widgets/responsive_builder.dart';

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
    if (mounted) {
      setState(() {
        _data = res.data;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    final data = _data;
    if (data == null) {
      return const Center(child: Text('Veri yuklenemedi', style: TextStyle(color: AppColors.textDim)));
    }

    final isDesktop = ResponsiveBuilder.isDesktop(context);
    final crossAxisCount = isDesktop ? 4 : 2;

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome
            const Text('Tekrar hos geldiniz', style: TextStyle(
                color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Gosterge Paneli', style: TextStyle(color: AppColors.textDim, fontSize: 13)),
            const SizedBox(height: 24),

            // KPI Cards
            GridView.count(
              crossAxisCount: crossAxisCount,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: isDesktop ? 2.2 : 1.8,
              children: [
                _buildKpiCard('BUGUNUN RANDEVULARI', '${data.todayAppointmentsCount}',
                    subtitle: '${data.upcomingAppointments} yaklasan', icon: Icons.calendar_today),
                _buildKpiCard('BU AY GELIR', '${data.thisMonthRevenue.toStringAsFixed(0)} TL',
                    gradient: true, icon: Icons.trending_up),
                _buildKpiCard('TOPLAM MUSTERI', '${data.totalCustomers}', icon: Icons.people),
                _buildKpiCard('HAFTALIK GELIR', '${data.thisWeekRevenue.toStringAsFixed(0)} TL',
                    valueColor: AppColors.green, icon: Icons.attach_money),
              ],
            ),
            const SizedBox(height: 24),

            // Charts + Schedule
            isDesktop
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 2, child: _buildChartCard(data)),
                      const SizedBox(width: 16),
                      Expanded(child: _buildScheduleCard(data)),
                    ],
                  )
                : Column(
                    children: [
                      _buildChartCard(data),
                      const SizedBox(height: 16),
                      _buildScheduleCard(data),
                    ],
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard(String label, String value,
      {String? subtitle, bool gradient = false, Color? valueColor, IconData? icon}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(
              color: AppColors.textDim, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1)),
          const SizedBox(height: 8),
          gradient
              ? ShaderMask(
                  shaderCallback: (b) => const LinearGradient(
                      colors: [AppColors.primary, AppColors.accent]).createShader(b),
                  child: Text(value, style: const TextStyle(
                      fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
                )
              : Text(value, style: TextStyle(
                  fontSize: 28, fontWeight: FontWeight.bold,
                  color: valueColor ?? Colors.white)),
          if (subtitle != null)
            Container(
              margin: const EdgeInsets.only(top: 6),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF1a1040),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(subtitle, style: const TextStyle(color: AppColors.accent, fontSize: 11)),
            ),
        ],
      ),
    );
  }

  Widget _buildChartCard(DashboardSummary data) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('GELIR & GIDER TRENDI', style: TextStyle(
              color: AppColors.textDim, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1)),
          const SizedBox(height: 20),
          SizedBox(
            height: 260,
            child: data.monthlyTrend.isEmpty
                ? const Center(child: Text('Veri yok', style: TextStyle(color: AppColors.textDim)))
                : BarChart(
                    BarChartData(
                      barGroups: data.monthlyTrend.asMap().entries.map((e) {
                        return BarChartGroupData(x: e.key, barRods: [
                          BarChartRodData(toY: e.value.revenue, color: AppColors.primary, width: 12,
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
                          BarChartRodData(toY: e.value.expense, color: AppColors.red, width: 12,
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
                        ]);
                      }).toList(),
                      titlesData: FlTitlesData(
                        bottomTitles: AxisTitles(sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, _) {
                            final i = value.toInt();
                            if (i < data.monthlyTrend.length) {
                              return Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text(data.monthlyTrend[i].month,
                                    style: const TextStyle(color: AppColors.textDim, fontSize: 10)),
                              );
                            }
                            return const SizedBox.shrink();
                          },
                        )),
                        leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      ),
                      gridData: const FlGridData(show: false),
                      borderData: FlBorderData(show: false),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleCard(DashboardSummary data) {
    return Container(
      padding: const EdgeInsets.all(20),
      constraints: const BoxConstraints(minHeight: 340),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('BUGUNUN PROGRAMI', style: TextStyle(
              color: AppColors.textDim, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1)),
          const SizedBox(height: 16),
          if (data.todaySchedule.isEmpty)
            const Text('Bugun randevu yok', style: TextStyle(color: AppColors.textDim, fontSize: 13))
          else
            ...data.todaySchedule.map((a) => Container(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: const BoxDecoration(
                    border: Border(bottom: BorderSide(color: AppColors.cardBorder)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 50,
                        child: Text(a.time, style: const TextStyle(
                            color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.w600)),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(a.customerName, style: const TextStyle(
                                color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                            Text(a.treatmentName, style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11)),
                            Text(a.staffName, style: const TextStyle(
                                color: AppColors.textDim, fontSize: 10)),
                          ],
                        ),
                      ),
                    ],
                  ),
                )),
        ],
      ),
    );
  }
}
