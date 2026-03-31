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
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              const Text('Musteriler', style: TextStyle(
                  color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              const Spacer(),
              _buildAddButton(),
            ],
          ),
          const SizedBox(height: 16),

          // Search
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Row(
              children: [
                const Icon(Icons.search, color: AppColors.textDim, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
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
                : _buildTable(),
          ),

          // Pagination
          _buildPagination(),
        ],
      ),
    );
  }

  Widget _buildTable() {
    if (_customers.isEmpty) {
      return const Center(child: Text('Musteri bulunamadi', style: TextStyle(color: AppColors.textDim)));
    }

    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(const Color(0xFF0a0815)),
            dataRowColor: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) return AppColors.navActive;
              return AppColors.cardBg;
            }),
            headingTextStyle: const TextStyle(
                color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600),
            dataTextStyle: const TextStyle(color: Colors.white, fontSize: 13),
            columns: const [
              DataColumn(label: Text('AD SOYAD')),
              DataColumn(label: Text('TELEFON')),
              DataColumn(label: Text('E-POSTA')),
              DataColumn(label: Text('ZIYARET')),
              DataColumn(label: Text('HARCAMA')),
              DataColumn(label: Text('ISLEMLER')),
            ],
            rows: _customers.map((c) => DataRow(cells: [
              DataCell(Text(c.fullName)),
              DataCell(Text(c.phone)),
              DataCell(Text(c.email ?? '-')),
              DataCell(Text('${c.totalVisits}')),
              DataCell(Text('${c.totalSpent.toStringAsFixed(0)}')),
              DataCell(Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(icon: const Icon(Icons.edit, size: 18, color: AppColors.textNav),
                      onPressed: () {}),
                  IconButton(icon: const Icon(Icons.delete, size: 18, color: AppColors.red),
                      onPressed: () => _deleteCustomer(c.id)),
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

  Widget _buildPagination() {
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          TextButton(
            onPressed: _page > 1 ? () { _page--; _loadData(); } : null,
            child: Text('Onceki', style: TextStyle(color: _page > 1 ? AppColors.textNav : AppColors.textDim)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text('$_page / $_totalPages',
                style: const TextStyle(color: AppColors.textDim, fontSize: 13)),
          ),
          TextButton(
            onPressed: _page < _totalPages ? () { _page++; _loadData(); } : null,
            child: Text('Sonraki', style: TextStyle(
                color: _page < _totalPages ? AppColors.textNav : AppColors.textDim)),
          ),
        ],
      ),
    );
  }
}
