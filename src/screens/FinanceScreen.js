import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView, ScrollView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { borrarTodo, guardarDinero, guardarMovimientos, leerDinero, leerMovimientos } from '../utils/storage';

export default function FinanceScreen() {
    const [saldo, setSaldo] = useState(0);
    const [movimientos, setMovimientos] = useState([]);
    const [cargando, setCargando] = useState(true);

    // --- ESTADOS PARA EL MODAL (VENTANA EMERGENTE) ---
    const [modalVisible, setModalVisible] = useState(false);
    const [tipoAccion, setTipoAccion] = useState('ingreso'); // 'ingreso' o 'gasto'
    const [montoInput, setMontoInput] = useState('');
    const [tituloInput, setTituloInput] = useState('');

    // Carga inicial de datos
    useEffect(() => {
        const cargarDatos = async () => {
            const saldoGuardado = await leerDinero();
            const movimientosGuardados = await leerMovimientos();

            if (saldoGuardado !== null) setSaldo(saldoGuardado);
            else setSaldo(1250000);

            if (movimientosGuardados !== null) setMovimientos(movimientosGuardados);
            else {
                const datosIniciales = [
                    { id: 1, titulo: 'Uber Eats', fecha: 'Hoy, 14:30', monto: -12500, icono: '🍔' },
                ];
                setMovimientos(datosIniciales);
                guardarMovimientos(datosIniciales);
            }
            setCargando(false);
        };
        cargarDatos();
    }, []);

    // --- LÓGICA DEL MODAL ---
    const abrirModal = (tipo) => {
        setTipoAccion(tipo);
        setMontoInput('');
        setTituloInput('');
        setModalVisible(true);
    };

    const guardarTransaccion = () => {
        // 1. Validar que haya datos
        if (!montoInput || !tituloInput) {
            Alert.alert("Faltan datos", "Por favor escribe un monto y una descripción.");
            return;
        }

        // 2. Convertir texto a número
        const montoNumerico = parseInt(montoInput);
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            Alert.alert("Error", "Ingresa un monto válido mayor a 0.");
            return;
        }

        // 3. Calcular nuevo saldo
        let nuevoSaldo = saldo;
        let montoFinal = montoNumerico;
        let icono = '💰';

        if (tipoAccion === 'ingreso') {
            nuevoSaldo += montoNumerico;
            icono = '💵';
        } else {
            // Es gasto
            if (saldo < montoNumerico) {
                Alert.alert("¡Ups!", "No tienes suficiente saldo para este gasto.");
                return;
            }
            nuevoSaldo -= montoNumerico;
            montoFinal = -montoNumerico; // Guardamos negativo para el historial
            icono = '💸';
        }

        // 4. Guardar todo
        setSaldo(nuevoSaldo);
        guardarDinero(nuevoSaldo);

        const nuevoMovimiento = {
            id: Date.now(),
            titulo: tituloInput,
            fecha: 'Justo ahora',
            monto: montoFinal,
            icono: icono
        };

        const nuevaLista = [nuevoMovimiento, ...movimientos];
        setMovimientos(nuevaLista);
        guardarMovimientos(nuevaLista);

        // 5. Cerrar y limpiar
        setModalVisible(false);
    };

    // --- UTILIDADES ---
    const handleReset = async () => {
        await borrarTodo();
        Alert.alert("Reinicio", "Datos borrados. Cierra y abre la app.");
    };

    const formatoDinero = (valor) => {
        return '$ ' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    if (cargando) {
        return (
            <View style={styles.center}>
                <Text style={{ color: '#38bdf8' }}>Cargando Billetera...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.headerTitle}>Billetera Kairo</Text>

                {/* Tarjeta de Saldo */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Saldo Disponible</Text>
                    <Text style={styles.balanceAmount}>{formatoDinero(saldo)}</Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardNumber}>**** **** **** 4242</Text>
                        <Text style={{ fontSize: 20 }}>💳</Text>
                    </View>
                </View>

                {/* Botones de Acción */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => abrirModal('ingreso')}>
                        <View style={[styles.emojiCircle, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                            <Text style={styles.emoji}>💰</Text>
                        </View>
                        <Text style={styles.actionText}>Ingresar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => abrirModal('gasto')}>
                        <View style={[styles.emojiCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Text style={styles.emoji}>💸</Text>
                        </View>
                        <Text style={styles.actionText}>Gastar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Pronto", "Gráficos en construcción")}>
                        <View style={[styles.emojiCircle, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                            <Text style={styles.emoji}>📊</Text>
                        </View>
                        <Text style={styles.actionText}>Analizar</Text>
                    </TouchableOpacity>
                </View>

                {/* Historial */}
                <Text style={styles.sectionTitle}>Historial</Text>
                <View style={styles.transactionList}>
                    {movimientos.map((item) => (
                        <View key={item.id} style={styles.transactionItem}>
                            <View style={styles.transactionIcon}>
                                <Text style={{ fontSize: 22 }}>{item.icono}</Text>
                            </View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionTitle}>{item.titulo}</Text>
                                <Text style={styles.transactionDate}>{item.fecha}</Text>
                            </View>
                            <Text style={[
                                styles.transactionAmount,
                                { color: item.monto > 0 ? '#22c55e' : '#ef4444' }
                            ]}>
                                {item.monto > 0 ? '+' : ''} {formatoDinero(item.monto)}
                            </Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity onPress={handleReset} style={{ marginTop: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#475569', fontSize: 12 }}>Resetear Memoria</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* --- AQUÍ ESTÁ EL MODAL --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {tipoAccion === 'ingreso' ? 'Nueva Entrada 🤑' : 'Nuevo Gasto 📉'}
                        </Text>

                        <Text style={styles.label}>Monto:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 5000"
                            placeholderTextColor="#64748b"
                            keyboardType="numeric"
                            value={montoInput}
                            onChangeText={setMontoInput}
                        />

                        <Text style={styles.label}>Descripción:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Completo italiano"
                            placeholderTextColor="#64748b"
                            value={tituloInput}
                            onChangeText={setTituloInput}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.btnText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btn, styles.btnSave]}
                                onPress={guardarTransaccion}
                            >
                                <Text style={styles.btnText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 20 },

    // Tarjetas y Botones (Estilos anteriores)
    balanceCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 25, marginBottom: 25, borderWidth: 1, borderColor: '#334155', elevation: 5 },
    balanceLabel: { color: '#94a3b8', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
    balanceAmount: { color: '#ffffff', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    cardNumber: { color: '#64748b', fontSize: 16, fontFamily: 'monospace' },
    actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    actionButton: { alignItems: 'center', width: '30%' },
    emojiCircle: { width: 65, height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    emoji: { fontSize: 32 },
    actionText: { color: '#cbd5e1', fontSize: 13, fontWeight: '600' },

    // Lista
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 15 },
    transactionList: { backgroundColor: '#1e293b', borderRadius: 16, padding: 10 },
    transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
    transactionIcon: { width: 45, height: 45, backgroundColor: '#334155', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    transactionInfo: { flex: 1 },
    transactionTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '500' },
    transactionDate: { color: '#64748b', fontSize: 12 },
    transactionAmount: { fontSize: 16, fontWeight: 'bold' },

    // --- ESTILOS DEL MODAL (NUEVO) ---
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)', // Fondo oscuro semitransparente
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#1e293b',
        padding: 25,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#38bdf8', // Borde Cyan brillante
        shadowColor: '#38bdf8',
        shadowOpacity: 0.5,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        color: '#94a3b8',
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#0f172a',
        color: '#fff',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 20,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    btn: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnCancel: {
        backgroundColor: '#334155',
        marginRight: 10,
    },
    btnSave: {
        backgroundColor: '#38bdf8', // Cyan Kairo
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});