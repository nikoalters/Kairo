import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { guardarMinutos, leerMinutos } from '../utils/storage';

export default function CerebroScreen() {
    const [segundos, setSegundos] = useState(25 * 60);
    const [activo, setActivo] = useState(false);
    const [minutosAcumulados, setMinutosAcumulados] = useState(0);

    // Cargar minutos totales al iniciar
    useEffect(() => {
        const cargarTiempo = async () => {
            const guardado = await leerMinutos();
            setMinutosAcumulados(guardado);
        };
        cargarTiempo();
    }, []);

    useEffect(() => {
        let intervalo = null;
        if (activo && segundos > 0) {
            intervalo = setInterval(() => {
                setSegundos(segundos => segundos - 1);
            }, 1000); // Velocidad normal (1 segundo)
        } else if (segundos === 0 && activo) {
            // CUANDO TERMINA EL TIEMPO:
            setActivo(false);
            Vibration.vibrate();
            finalizarSesion();
        }
        return () => clearInterval(intervalo);
    }, [activo, segundos]);

    const finalizarSesion = async () => {
        const nuevosMinutos = minutosAcumulados + 25;
        setMinutosAcumulados(nuevosMinutos);
        await guardarMinutos(nuevosMinutos);
        Alert.alert("¡Sesión Completada!", "Has sumado +25 minutos de enfoque. 🧠");
        setSegundos(25 * 60); // Resetear reloj
    };

    const formatoTiempo = (tiempo) => {
        const mins = Math.floor(tiempo / 60);
        const segs = tiempo % 60;
        return `${mins < 10 ? '0' + mins : mins}:${segs < 10 ? '0' + segs : segs}`;
    };

    const resetear = () => {
        setActivo(false);
        setSegundos(25 * 60);
    };

    // Truco para pruebas: Botón oculto para sumar tiempo sin esperar 25 min
    const debugSumarTiempo = async () => {
        const nuevosMinutos = minutosAcumulados + 5;
        setMinutosAcumulados(nuevosMinutos);
        await guardarMinutos(nuevosMinutos);
        Alert.alert("Debug", "+5 minutos agregados mágicamente");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.headerTitle}>Mi Cerebro Digital</Text>

                <View style={[styles.focusCard, activo && styles.focusCardActive]}>
                    <View>
                        <Text style={styles.focusLabel}>Modo Enfoque</Text>
                        <Text style={styles.focusTimer}>{formatoTiempo(segundos)}</Text>
                        <Text style={styles.focusStatus}>
                            {activo ? '🔥 Enfocado...' : 'Listo para iniciar'}
                        </Text>
                    </View>

                    <View style={styles.timerControls}>
                        <TouchableOpacity
                            style={[styles.playButton, activo ? styles.pauseButton : null]}
                            onPress={() => setActivo(!activo)}
                        >
                            <Ionicons name={activo ? "pause" : "play"} size={30} color="#fff" />
                        </TouchableOpacity>

                        {!activo && segundos !== 1500 && (
                            <TouchableOpacity style={styles.resetButton} onPress={resetear}>
                                <Ionicons name="refresh" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Estadísticas de Estudio */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{minutosAcumulados}</Text>
                        <Text style={styles.statLabel}>Minutos Totales</Text>
                    </View>
                    <TouchableOpacity onPress={debugSumarTiempo} style={styles.statItem}>
                        <Ionicons name="flash" size={24} color="#f59e0b" />
                        <Text style={styles.statLabel}>Cheat (+5m)</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Habilidades</Text>
                <View style={styles.skillsContainer}>
                    <View style={styles.skillItem}>
                        <View style={styles.skillHeader}>
                            <Text style={styles.skillName}>React Native</Text>
                            <Text style={styles.skillLevel}>Nivel 5</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '40%', backgroundColor: '#38bdf8' }]} />
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    scrollContent: { padding: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 20 },

    focusCard: {
        backgroundColor: '#1e293b', borderRadius: 20, padding: 25, flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
        borderLeftWidth: 4, borderLeftColor: '#334155'
    },
    focusCardActive: { borderLeftColor: '#38bdf8', backgroundColor: '#172033' },
    focusLabel: { color: '#94a3b8', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
    focusTimer: { color: '#ffffff', fontSize: 42, fontWeight: 'bold', fontFamily: 'monospace' },
    focusStatus: { color: '#38bdf8', fontSize: 14, fontWeight: '600' },
    timerControls: { alignItems: 'center', gap: 10 },
    playButton: { backgroundColor: '#38bdf8', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    pauseButton: { backgroundColor: '#ef4444' },
    resetButton: { padding: 10 },

    // Stats
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statItem: { flex: 1, backgroundColor: '#1e293b', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
    statValue: { color: '#f8fafc', fontSize: 24, fontWeight: 'bold' },
    statLabel: { color: '#94a3b8', fontSize: 12, marginTop: 4 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 15 },
    skillsContainer: { backgroundColor: '#1e293b', padding: 15, borderRadius: 16, marginBottom: 30 },
    skillItem: { marginBottom: 15 },
    skillHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    skillName: { color: '#e2e8f0', fontWeight: 'bold', fontSize: 15 },
    skillLevel: { color: '#38bdf8', fontWeight: 'bold', fontSize: 12 },
    progressBarBg: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
});