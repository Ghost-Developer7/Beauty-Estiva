import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/api_response.dart';
import '../../../core/models/customer_models.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  final _api = ApiService();
  final _searchController = TextEditingController();
  List<CustomerListItem> _customers = [];
  bool _loading = true;
  int _page = 1;
  int _totalPages = 1;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    final params = <String, dynamic>{'pageNumber': _page, 'pageSize': 20};
    if (_searchController.text.isNotEmpty) params['search'] = _searchController.text;

    final res = await _api.get('/customer', queryParameters: params,
        fromData: (d) => PaginatedResponse.fromJson(d, CustomerListItem.fromJson));
    if (mounted) {
      setState(() {
        if (res.success && res.data != null) {
          _customers = res.data!.items;
          _totalPages = res.data!.totalPages;
        }
        _loading = false;
      });
    }
  }

  Future<void> _deleteCustomer(int id) async {
    await _api.delete('/customer/$id');
    _loadData();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Text('Musteriler', style: TextStyle(
                  color: c.textPrimary, fontSize: 24, fontWeight: FontWeight.bold)),
              const Spacer(),
              _buildAddButton(),
            ],
          ),
          const SizedBox(height: 16),

          // Search
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
            decoration: BoxDecoration(
              color: c.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: c.cardBorder),
            ),
            child: Row(
              children: [
                Icon(Icons.search, color: c.textDim, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    style: TextStyle(color: c.textPrimary, fontSize: 14),
                    decoration: const InputDecoration(
                      hintText: 'Ara...', border: InputBorder.none,
                      enabledBorder: InputBorder.none, focusedBorder: InputBorder.none,
                    ),
                    onSubmitted: (_) { _page = 1; _loadData(); },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Table
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _buildTable(c),
          ),

          // Pagination
          _buildPagination(c),
        ],
      ),
    );
  }

  Widget _buildTable(AppColors c) {
    if (_customers.isEmpty) {
      return Center(child: Text('Musteri bulunamadi', style: TextStyle(color: c.textDim)));
    }

    return Container(
      decoration: BoxDecoration(
        color: c.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: c.cardBorder),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(c.tableHeaderBg),
            dataRowColor: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) return c.navActive;
              return c.cardBg;
            }),
            headingTextStyle: TextStyle(
                color: c.textDim, fontSize: 11, fontWeight: FontWeight.w600),
            dataTextStyle: TextStyle(color: c.textPrimary, fontSize: 13),
            columns: const [
              DataColumn(label: Text('AD SOYAD')),
              DataColumn(label: Text('TELEFON')),
              DataColumn(label: Text('E-POSTA')),
              DataColumn(label: Text('ZIYARET')),
              DataColumn(label: Text('HARCAMA')),
              DataColumn(label: Text('ISLEMLER')),
            ],
            rows: _customers.map((cust) => DataRow(cells: [
              DataCell(Text(cust.fullName)),
              DataCell(Text(cust.phone)),
              DataCell(Text(cust.email ?? '-')),
              DataCell(Text('${cust.totalVisits}')),
              DataCell(Text('${cust.totalSpent.toStringAsFixed(0)}')),
              DataCell(Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(icon: Icon(Icons.edit, size: 18, color: c.textNav),
                      onPressed: () {}),
                  IconButton(icon: const Icon(Icons.delete, size: 18, color: AppColors.red),
                      onPressed: () => _deleteCustomer(cust.id)),
                ],
              )),
            ])).toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildAddButton() {
    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {},
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.add, color: Colors.white, size: 16),
                SizedBox(width: 6),
                Text('Ekle', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPagination(AppColors c) {
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          TextButton(
            onPressed: _page > 1 ? () { _page--; _loadData(); } : null,
            child: Text('Önceki', style: TextStyle(color: _page > 1 ? c.textNav : c.textDim)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text('$_page / $_totalPages',
                style: TextStyle(color: c.textDim, fontSize: 13)),
          ),
          TextButton(
            onPressed: _page < _totalPages ? () { _page++; _loadData(); } : null,
            child: Text('Sonraki', style: TextStyle(
                color: _page < _totalPages ? c.textNav : c.textDim)),
          ),
        ],
      ),
    );
  }
}
