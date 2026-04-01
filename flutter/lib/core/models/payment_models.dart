class PaymentListItem {
  final int id;
  final int appointmentId;
  final String customerFullName;
  final String treatmentName;
  final String staffFullName;
  final String appointmentStartTime;
  final double amount;
  final String currencyCode;
  final String currencySymbol;
  final double exchangeRateToTry;
  final double amountInTry;
  final int paymentMethodValue;
  final String paymentMethodDisplay;
  final String? paidAt;
  final String? notes;

  PaymentListItem({
    required this.id,
    required this.appointmentId,
    required this.customerFullName,
    required this.treatmentName,
    required this.staffFullName,
    required this.appointmentStartTime,
    required this.amount,
    required this.currencyCode,
    required this.currencySymbol,
    required this.exchangeRateToTry,
    required this.amountInTry,
    required this.paymentMethodValue,
    required this.paymentMethodDisplay,
    this.paidAt,
    this.notes,
  });

  factory PaymentListItem.fromJson(Map<String, dynamic> json) =>
      PaymentListItem(
        id: json['id'] ?? 0,
        appointmentId: json['appointmentId'] ?? 0,
        customerFullName: json['customerFullName'] ?? '',
        treatmentName: json['treatmentName'] ?? '',
        staffFullName: json['staffFullName'] ?? '',
        appointmentStartTime: json['appointmentStartTime'] ?? '',
        amount: (json['amount'] ?? 0).toDouble(),
        currencyCode: json['currencyCode'] ?? 'TRY',
        currencySymbol: json['currencySymbol'] ?? '\u20BA',
        exchangeRateToTry: (json['exchangeRateToTry'] ?? 1).toDouble(),
        amountInTry: (json['amountInTry'] ?? 0).toDouble(),
        paymentMethodValue: json['paymentMethodValue'] ?? 1,
        paymentMethodDisplay: json['paymentMethodDisplay'] ?? '',
        paidAt: json['paidAt'],
        notes: json['notes'],
      );
}

class PaymentCreate {
  final int appointmentId;
  final double amount;
  final int? currencyId;
  final int paymentMethod;
  final String? notes;

  PaymentCreate({
    required this.appointmentId,
    required this.amount,
    this.currencyId,
    required this.paymentMethod,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
        'appointmentId': appointmentId,
        'amount': amount,
        if (currencyId != null) 'currencyId': currencyId,
        'paymentMethod': paymentMethod,
        if (notes != null && notes!.isNotEmpty) 'notes': notes,
      };
}

class CurrencyItem {
  final int id;
  final String code;
  final String symbol;
  final String name;
  final bool isDefault;
  final double exchangeRateToTry;

  CurrencyItem({
    required this.id,
    required this.code,
    required this.symbol,
    required this.name,
    required this.isDefault,
    required this.exchangeRateToTry,
  });

  factory CurrencyItem.fromJson(Map<String, dynamic> json) => CurrencyItem(
        id: json['id'] ?? 0,
        code: json['code'] ?? '',
        symbol: json['symbol'] ?? '',
        name: json['name'] ?? '',
        isDefault: json['isDefault'] ?? false,
        exchangeRateToTry: (json['exchangeRateToTry'] ?? 1).toDouble(),
      );
}
