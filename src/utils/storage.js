import AsyncStorage from '@react-native-async-storage/async-storage';

// --- DINERO ---
export const guardarDinero = async (monto) => {
    try {
        await AsyncStorage.setItem('kairo_saldo', monto.toString());
    } catch (e) {
        console.error(e);
    }
};

export const leerDinero = async () => {
    try {
        const valor = await AsyncStorage.getItem('kairo_saldo');
        return valor != null ? parseInt(valor) : null;
    } catch (e) {
        return null;
    }
};

// --- MOVIMIENTOS ---
export const guardarMovimientos = async (lista) => {
    try {
        const jsonValue = JSON.stringify(lista);
        await AsyncStorage.setItem('kairo_movimientos', jsonValue);
    } catch (e) {
        console.error(e);
    }
};

export const leerMovimientos = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('kairo_movimientos');
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        return null;
    }
};

// --- TIEMPO DE ENFOQUE (NUEVO) ---
export const guardarMinutos = async (minutos) => {
    try {
        await AsyncStorage.setItem('kairo_minutos', minutos.toString());
    } catch (e) {
        console.error(e);
    }
};

export const leerMinutos = async () => {
    try {
        const valor = await AsyncStorage.getItem('kairo_minutos');
        return valor != null ? parseInt(valor) : 0;
    } catch (e) {
        return 0;
    }
};

// --- BORRAR TODO ---
export const borrarTodo = async () => {
    try {
        await AsyncStorage.clear();
    } catch (e) {
        console.error(e);
    }
}