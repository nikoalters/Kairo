import { Ionicons } from '@expo/vector-icons';
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
import {
    guardarDinero,
    guardarListaMetas,
    guardarMovimientos,
    leerDinero,
    leerListaMetas,
    leerMovimientos
} from '../utils/storage';

export default function FinanceScreen() {
    const [saldo, setSaldo] = useState(0);
    const [movimientos, setMovimientos] = useState([]);
    const [metas, setMetas] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados para el Gráfico
    const [totalIngresos, setTotalIngresos] = useState(0);
    const [totalGastos, setTotalGastos] = useState(0);

    // Modales
    const [modalVisible, setModalVisible] = useState(false);
    const [tipoAccion, setTipoAccion] = useState('ingreso');
    const [montoInput, setMontoInput] = useState('');
    const [tituloInput, setTituloInput] = useState('');
    const [destinoSeleccionado, setDestinoSeleccionado] = useState('billetera');

    const [modalMetaVisible, setModalMetaVisible] = useState(false);
    const [nombreMeta, setNombreMeta] = useState('');
    const [montoMeta, setMontoMeta] = useState('');

    const [modalDetalleMeta, setModalDetalleMeta] = useState(false);
    const [metaSeleccionada, setMetaSeleccionada] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    // Recalcular gráfico cada vez que cambian los movimientos
    useEffect(() => {
        calcularTotales();
    }, [movimientos]);

    const cargarDatos = async () => {
        const s = await leerDinero();
        const m = await leerMovimientos();
        const metasGuardadas = await leerListaMetas();
        setSaldo(s || 0);
        setMovimientos(m || []);
        setMetas(metasGuardadas || []);
        setCargando(false);
    };

    const calcularTotales = () => {
        // Filtramos el historial para sumar ingresos y gastos
        // Nota: Asumimos que los movimientos guardados tienen { monto: positivos o negativos }
        const ingresos = movimientos
            .filter(m => m.tipo === 'ingreso' || (m.tipo === 'neutro' && m.monto > 0)) // Ingresos y Ahorros
            .reduce((acc, curr) => acc + Math.abs(curr.monto), 0);

        const gastos = movimientos
            .filter(m => m.tipo === 'gasto')
            .reduce((acc, curr) => acc + Math.abs(curr.monto), 0);

        setTotalIngresos(ingresos);
        setTotalGastos(gastos);
    };

    // --- LÓGICA DE METAS ---
    const crearMeta = () => {
        if (!nombreMeta || !montoMeta) return;
        const nuevaMeta = {
            id: Date.now().toString(),
            nombre: nombreMeta,
            objetivo: parseInt(montoMeta),
            ahorrado: 0
        };
        const nuevasMetas = [...metas, nuevaMeta];
        setMetas(nuevasMetas);
        guardarListaMetas(nuevasMetas);
        setModalMetaVisible(false);
        setNombreMeta(''); setMontoMeta('');
    };

    const confirmarEliminarMeta = () => {
        if (!metaSeleccionada) return;
        const tieneFondos = metaSeleccionada.ahorrado > 0;
        Alert.alert(
            "Eliminar Meta",
            tieneFondos ? `Hay ${formatoDinero(metaSeleccionada.ahorrado)}. ¿Qué hacemos?` : "¿Borrar meta?",
            [
                { text: "Cancelar", style: "cancel" },
                tieneFondos ? { text: "Devolver a Billetera", onPress: () => eliminarMeta(true) } : null,
                { text: tieneFondos ? "Borrar (Sin devolver)" : "Sí, Borrar", style: "destructive", onPress: () => eliminarMeta(false) }
            ].filter(Boolean)
        );
    };

    const eliminarMeta = (devolverPlata) => {
        if (devolverPlata) {
            const nuevoSaldo = saldo + metaSeleccionada.ahorrado;
            setSaldo(nuevoSaldo);
            guardarDinero(nuevoSaldo);
            registrarMovimiento(`Cierre Meta: ${metaSeleccionada.nombre}`, metaSeleccionada.ahorrado, '💰', 'ingreso');
        }
        const nuevasMetas = metas.filter(m => m.id !== metaSeleccionada.id);
        setMetas(nuevasMetas);
        guardarListaMetas(nuevasMetas);
        setModalDetalleMeta(false);
    };

    const gestionarMeta = (accion, monto) => {
        if (!metaSeleccionada || !monto) return;
        const valor = parseInt(monto);
        if (isNaN(valor) || valor <= 0) return;

        if (accion === 'retirar') {
            if (metaSeleccionada.ahorrado < valor) { Alert.alert("Error", "Saldo insuficiente en meta"); return; }
            const nuevoSaldo = saldo + valor;
            setSaldo(nuevoSaldo);
            guardarDinero(nuevoSaldo);
            registrarMovimiento(`Rescate: ${metaSeleccionada.nombre}`, valor, '🚨', 'ingreso');
        }

        const metasActualizadas = metas.map(m => {
            if (m.id === metaSeleccionada.id) {
                const nuevoAhorro = accion === 'depositar' ? m.ahorrado + valor : m.ahorrado - valor;
                return { ...m, ahorrado: nuevoAhorro };
            }
            return m;
        });
        setMetas(metasActualizadas);
        guardarListaMetas(metasActualizadas);
        setModalDetalleMeta(false);
    };

    // --- TRANSACCIONES ---
    const procesarTransaccion = () => {
        const valor = parseInt(montoInput);
        if (!tituloInput || isNaN(valor) || valor <= 0) { Alert.alert("Error", "Datos inválidos"); return; }

        if (tipoAccion === 'gasto') {
            if (saldo < valor) { Alert.alert("Saldo Insuficiente", "Falta plata en la billetera."); return; }
            const nuevoSaldo = saldo - valor;
            setSaldo(nuevoSaldo);
            guardarDinero(nuevoSaldo);
            registrarMovimiento(tituloInput, -valor, '💸', 'gasto');
        } else {
            if (destinoSeleccionado === 'billetera') {
                const nuevoSaldo = saldo + valor;
                setSaldo(nuevoSaldo);
                guardarDinero(nuevoSaldo);
                registrarMovimiento(tituloInput, valor, '💰', 'ingreso');
            } else {
                const metasActualizadas = metas.map(m => {
                    if (m.id === destinoSeleccionado) return { ...m, ahorrado: m.ahorrado + valor };
                    return m;
                });
                setMetas(metasActualizadas);
                guardarListaMetas(metasActualizadas);
                const metaDestino = metas.find(m => m.id === destinoSeleccionado);
                registrarMovimiento(`${tituloInput} (${metaDestino.nombre})`, valor, '🎯', 'neutro');
            }
        }
        setModalVisible(false);
    };

    const registrarMovimiento = (titulo, monto, icono, tipo) => {
        const nuevoMov = { id: Date.now(), titulo, fecha: new Date().toLocaleDateString(), monto, icono, tipo };
        const lista = [nuevoMov, ...movimientos];
        setMovimientos(lista);
        guardarMovimientos(lista);
    };

    const abrirModalIngreso = () => { setTipoAccion('ingreso'); setDestinoSeleccionado('billetera'); setMontoInput(''); setTituloInput(''); setModalVisible(true); };
    const abrirModalGasto = () => { setTipoAccion('gasto'); setMontoInput(''); setTituloInput(''); setModalVisible(true); };
    const formatoDinero = (valor) => '$ ' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Cálculos visuales para el gráfico
    const maxGrafico = Math.max(totalIngresos, totalGastos, 1); // Evitar división por cero
    const alturaIngresos = (totalIngresos / maxGrafico) * 100;
    const alturaGastos = (totalGastos / maxGrafico) * 100;

    if (cargando) return <View style={styles.center}><Text style={{ color: '#38bdf8' }}>Cargando...</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.headerTitle}>Finanzas</Text>

                {/* --- NUEVO: GRÁFICO DE BARRAS --- */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Flujo de Caja (Histórico)</Text>
                    <View style={styles.chartContainer}>
                        {/* Barra Ingresos */}
                        <View style={styles.barGroup}>
                            <Text style={styles.barValue}>{formatoDinero(totalIngresos)}</Text>
                            <View style={[styles.barTrack, { height: 100 }]}>
                                <View style={[styles.barFill, { height: `${alturaIngresos}%`, backgroundColor: '#22c55e' }]} />
                            </View>
                            <Text style={styles.barLabel}>Entradas</Text>
                        </View>

                        {/* VS */}
                        <View style={{ justifyContent: 'center', paddingBottom: 20 }}>
                            <Text style={{ color: '#64748b', fontWeight: 'bold' }}>VS</Text>
                        </View>

                        {/* Barra Gastos */}
                        <View style={styles.barGroup}>
                            <Text style={styles.barValue}>{formatoDinero(totalGastos)}</Text>
                            <View style={[styles.barTrack, { height: 100 }]}>
                                <View style={[styles.barFill, { height: `${alturaGastos}%`, backgroundColor: '#ef4444' }]} />
                            </View>
                            <Text style={styles.barLabel}>Salidas</Text>
                        </View>
                    </View>
                </View>
                {/* ------------------------------- */}

                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Disponible en Billetera</Text>
                    <Text style={styles.balanceAmount}>{formatoDinero(saldo)}</Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardNumber}>**** **** **** 4242</Text>
                        <Ionicons name="wallet" size={24} color="#38bdf8" />
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mis Metas</Text>
                    <TouchableOpacity onPress={() => setModalMetaVisible(true)}>
                        <Ionicons name="add-circle" size={28} color="#38bdf8" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 25 }}>
                    {metas.length === 0 ? (
                        <TouchableOpacity style={styles.emptyGoalCard} onPress={() => setModalMetaVisible(true)}>
                            <Text style={{ color: '#64748b' }}>+ Crear Nueva Meta</Text>
                        </TouchableOpacity>
                    ) : (
                        metas.map(meta => (
                            <TouchableOpacity key={meta.id} style={styles.goalCardMini} onPress={() => { setMetaSeleccionada(meta); setModalDetalleMeta(true); }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.goalTitleMini}>{meta.nombre}</Text>
                                    <Text style={styles.goalPercentMini}>{Math.floor(Math.min((meta.ahorrado / meta.objetivo) * 100, 100))}%</Text>
                                </View>
                                <Text style={styles.goalAmountMini}>{formatoDinero(meta.ahorrado)}</Text>
                                <View style={styles.progressBgMini}>
                                    <View style={[styles.progressFillMini, { width: `${Math.min((meta.ahorrado / meta.objetivo) * 100, 100)}%` }]} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={abrirModalIngreso}>
                        <View style={[styles.emojiCircle, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                            <Text style={styles.emoji}>💰</Text>
                        </View>
                        <Text style={styles.actionText}>Ingresar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={abrirModalGasto}>
                        <View style={[styles.emojiCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Text style={styles.emoji}>💸</Text>
                        </View>
                        <Text style={styles.actionText}>Gastar</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Movimientos</Text>
                <View style={styles.transactionList}>
                    {movimientos.map((item) => (
                        <View key={item.id} style={styles.transactionItem}>
                            <View style={styles.transactionIcon}><Text style={{ fontSize: 22 }}>{item.icono}</Text></View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionTitle}>{item.titulo}</Text>
                                <Text style={styles.transactionDate}>{item.fecha}</Text>
                            </View>
                            <Text style={[styles.transactionAmount, { color: item.tipo === 'gasto' ? '#ef4444' : '#22c55e' }]}>
                                {item.tipo === 'gasto' ? '-' : '+'} {formatoDinero(Math.abs(item.monto))}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* --- MODAL 1: INGRESAR / GASTAR --- */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{tipoAccion === 'ingreso' ? 'Recibir Dinero 🤑' : 'Realizar Gasto 📉'}</Text>
                        <Text style={styles.label}>Monto:</Text>
                        <TextInput style={styles.input} keyboardType="numeric" placeholder="0" placeholderTextColor="#64748b" value={montoInput} onChangeText={setMontoInput} />
                        <Text style={styles.label}>Descripción:</Text>
                        <TextInput style={styles.input} placeholder="..." placeholderTextColor="#64748b" value={tituloInput} onChangeText={setTituloInput} />
                        {tipoAccion === 'ingreso' && (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={styles.label}>Destino:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                                    <TouchableOpacity style={[styles.selectorBtn, destinoSeleccionado === 'billetera' && styles.selectorActive]} onPress={() => setDestinoSeleccionado('billetera')}>
                                        <Text style={styles.selectorText}>💳 Billetera</Text>
                                    </TouchableOpacity>
                                    {metas.map((meta) => (
                                        <TouchableOpacity key={meta.id} style={[styles.selectorBtn, destinoSeleccionado === meta.id && styles.selectorActive]} onPress={() => setDestinoSeleccionado(meta.id)}>
                                            <Text style={styles.selectorText}>🎯 {meta.nombre}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}><Text style={styles.btnText}>Cancelar</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={procesarTransaccion}><Text style={styles.btnText}>Guardar</Text></TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* --- MODAL 2: CREAR META --- */}
            <Modal animationType="fade" transparent={true} visible={modalMetaVisible} onRequestClose={() => setModalMetaVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { borderColor: '#f59e0b' }]}>
                        <Text style={styles.modalTitle}>Nueva Meta 🎯</Text>
                        <TextInput style={styles.input} placeholder="Nombre (ej: Vacaciones)" placeholderTextColor="#64748b" value={nombreMeta} onChangeText={setNombreMeta} />
                        <TextInput style={styles.input} placeholder="Monto Objetivo ($)" keyboardType="numeric" placeholderTextColor="#64748b" value={montoMeta} onChangeText={setMontoMeta} />
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#f59e0b', marginTop: 10 }]} onPress={crearMeta}><Text style={styles.btnText}>Crear Meta</Text></TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', marginTop: 15 }} onPress={() => setModalMetaVisible(false)}><Text style={{ color: '#64748b' }}>Cancelar</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL 3: GESTIONAR META --- */}
            <Modal animationType="slide" transparent={true} visible={modalDetalleMeta} onRequestClose={() => setModalDetalleMeta(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={[styles.modalTitle, { marginBottom: 0 }]}>{metaSeleccionada?.nombre}</Text>
                            <TouchableOpacity onPress={confirmarEliminarMeta} style={{ padding: 5 }}><Ionicons name="trash-outline" size={24} color="#ef4444" /></TouchableOpacity>
                        </View>
                        <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>Ahorrado: {formatoDinero(metaSeleccionada?.ahorrado || 0)} / {formatoDinero(metaSeleccionada?.objetivo || 0)}</Text>
                        <View style={[styles.progressBgMini, { height: 10, marginBottom: 20 }]}><View style={[styles.progressFillMini, { width: `${Math.min(((metaSeleccionada?.ahorrado || 0) / (metaSeleccionada?.objetivo || 1)) * 100, 100)}%` }]} /></View>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#ef4444', marginBottom: 10 }]} onPress={() => { Alert.alert("Retiro de Emergencia", "¿Cuánto retirar?", [{ text: "Todo", onPress: () => gestionarMeta('retirar', metaSeleccionada.ahorrado) }, { text: "Cancelar", style: "cancel" }]); }}><Text style={styles.btnText}>🚨 Retiro Emergencia</Text></TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', marginTop: 15 }} onPress={() => setModalDetalleMeta(false)}><Text style={{ color: '#64748b' }}>Cerrar</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 20 },

    // CHART STYLES (NUEVO)
    chartCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#334155' },
    chartTitle: { color: '#94a3b8', fontSize: 14, textTransform: 'uppercase', marginBottom: 15, textAlign: 'center' },
    chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 150 },
    barGroup: { alignItems: 'center', width: 60 },
    barTrack: { width: 20, backgroundColor: '#0f172a', borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
    barFill: { width: '100%', borderRadius: 10 },
    barLabel: { color: '#cbd5e1', fontSize: 12, marginTop: 8, fontWeight: 'bold' },
    barValue: { color: '#fff', fontSize: 10, marginBottom: 5, fontWeight: 'bold' },

    balanceCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 25, marginBottom: 25, borderWidth: 1, borderColor: '#334155' },
    balanceLabel: { color: '#94a3b8', fontSize: 14, textTransform: 'uppercase' },
    balanceAmount: { color: '#ffffff', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardNumber: { color: '#64748b', fontFamily: 'monospace' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc' },
    goalCardMini: { backgroundColor: '#1e293b', width: 160, padding: 15, borderRadius: 16, marginRight: 15, borderWidth: 1, borderColor: '#334155' },
    emptyGoalCard: { backgroundColor: 'rgba(30, 41, 59, 0.5)', width: 160, height: 100, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
    goalTitleMini: { color: '#f8fafc', fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    goalAmountMini: { color: '#f59e0b', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
    goalPercentMini: { color: '#94a3b8', fontSize: 12 },
    progressBgMini: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
    progressFillMini: { height: '100%', backgroundColor: '#f59e0b', borderRadius: 3 },
    actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
    actionButton: { alignItems: 'center', width: '40%' },
    emojiCircle: { width: 65, height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    emoji: { fontSize: 32 },
    actionText: { color: '#cbd5e1', fontWeight: '600' },
    transactionList: { backgroundColor: '#1e293b', borderRadius: 16, padding: 10 },
    transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
    transactionIcon: { width: 45, height: 45, backgroundColor: '#334155', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    transactionInfo: { flex: 1 },
    transactionTitle: { color: '#f1f5f9', fontWeight: '500' },
    transactionDate: { color: '#64748b', fontSize: 12 },
    transactionAmount: { fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
    modalContent: { width: '85%', backgroundColor: '#1e293b', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#38bdf8' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', marginBottom: 20, textAlign: 'center' },
    label: { color: '#94a3b8', marginBottom: 8, fontSize: 14, fontWeight: '600' },
    input: { backgroundColor: '#0f172a', color: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 20, fontSize: 16 },
    selectorBtn: { paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center', minWidth: 100 },
    selectorActive: { borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)' },
    selectorText: { color: '#cbd5e1', fontSize: 12, fontWeight: 'bold' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
    btnCancel: { backgroundColor: '#334155', marginRight: 10 },
    btnSave: { backgroundColor: '#38bdf8' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});