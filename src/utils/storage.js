import AsyncStorage from '@react-native-async-storage/async-storage';

// --- DINERO (Billetera Disponible) ---
export const guardarDinero = async (monto) => {
    try {
        await AsyncStorage.setItem('kairo_saldo', monto.toString());
    } catch (e) { console.error(e); }
};

export const leerDinero = async () => {
    try {
        const valor = await AsyncStorage.getItem('kairo_saldo');
        return valor != null ? parseInt(valor) : 0;
    } catch (e) { return 0; }
};

// --- MOVIMIENTOS ---
export const guardarMovimientos = async (lista) => {
    try {
        const jsonValue = JSON.stringify(lista);
        await AsyncStorage.setItem('kairo_movimientos', jsonValue);
    } catch (e) { console.error(e); }
};

export const leerMovimientos = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('kairo_movimientos');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) { return []; }
};

// --- MINUTOS (Cerebro) ---
export const guardarMinutos = async (minutos) => {
    try {
        await AsyncStorage.setItem('kairo_minutos', minutos.toString());
    } catch (e) { console.error(e); }
};

export const leerMinutos = async () => {
    try {
        const valor = await AsyncStorage.getItem('kairo_minutos');
        return valor != null ? parseInt(valor) : 0;
    } catch (e) { return 0; }
};

// --- METAS (NUEVO) ---
export const guardarListaMetas = async (lista) => {
    try {
        const jsonValue = JSON.stringify(lista);
        await AsyncStorage.setItem('kairo_metas_lista', jsonValue);
    } catch (e) { console.error(e); }
};

export const leerListaMetas = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('kairo_metas_lista');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) { return []; }
};

// --- BORRAR TODO ---
export const borrarTodo = async () => {
    try {
        await AsyncStorage.clear();
    } catch (e) { console.error(e); }
}