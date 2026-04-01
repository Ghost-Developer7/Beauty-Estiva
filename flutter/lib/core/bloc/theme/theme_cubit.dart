import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeCubit extends Cubit<bool> {
  ThemeCubit() : super(true) {
    _loadTheme();
  }

  bool get isDark => state;

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    emit(prefs.getBool('isDarkTheme') ?? true);
  }

  Future<void> toggleTheme() async {
    final newValue = !state;
    emit(newValue);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDarkTheme', newValue);
  }
}
