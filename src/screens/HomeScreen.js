import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

// Importamos tus utilidades
import { obtenerFraseAleatoria, obtenerSaludo } from '../utils/helpers';
// AQUI EL CAMBIO IMPORTANTE: Agregamos leerMinutos
import { leerDinero, leerMinutos } from '../utils/storage';

export default function HomeScreen() {
    const [saludo, setSaludo] = useState('');
    const [frase, setFrase] = useState({ texto: '', autor: '' });
    const [saldoActual, setSaldoActual] = useState(0);
    const [minutosEnfoque, setMinutosEnfoque] = useState(0); // Nuevo estado para el tiempo

    useFocusEffect(
        useCallback(() => {
            const cargarDatos = async () => {
                // 1. Cargar saludo y frase
                setSaludo(obtenerSaludo());
                setFrase(obtenerFraseAleatoria());

                // 2. Cargar el dinero real
                const dineroGuardado = await leerDinero();
                if (dineroGuardado !== null) {
                    setSaldoActual(dineroGuardado);
                } else {
                    setSaldoActual(0);
                }

                // 3. Cargar los minutos de enfoque (NUEVO)
                const minutosGuardados = await leerMinutos();
                if (minutosGuardados !== null) {
                    setMinutosEnfoque(minutosGuardados);
                } else {
                    setMinutosEnfoque(0);
                }
            };
            cargarDatos();
        }, [])
    );

    const formatoDinero = (valor) => {
        return '$ ' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.content}>

                {/* Saludo Dinámico */}
                <Text style={styles.greeting}>{saludo}</Text>
                <Text style={styles.subtitle}>Sistema Operativo Personal</Text>

                {/* Tarjeta de Frase Diaria */}
                <View style={styles.quoteCard}>
                    <Ionicons name="chatbox-ellipses-outline" size={24} color="#38bdf8" style={{ marginBottom: 10 }} />
                    <Text style={styles.quoteText}>"{frase.texto}"</Text>
                    <Text style={styles.quoteAuthor}>— {frase.autor}</Text>
                </View>

                {/* Resumen Rápido (Dashboard Conectado) */}
                <View style={styles.dashboardGrid}>

                    {/* Tarjeta de Saldo REAL */}
                    <View style={styles.dashboardItem}>
                        <Ionicons name="wallet-outline" size={24} color="#22c55e" />
                        <Text style={styles.dashLabel}>Saldo Actual</Text>
                        <Text style={styles.dashValue}>{formatoDinero(saldoActual)}</Text>
                    </View>

                    {/* Tarjeta de Enfoque REAL */}
                    <View style={styles.dashboardItem}>
                        <Ionicons name="hourglass-outline" size={24} color="#f59e0b" />
                        <Text style={styles.dashLabel}>Enfoque</Text>
                        {/* Aquí mostramos la variable de estado */}
                        <Text style={styles.dashValue}>{minutosEnfoque} min</Text>
                    </View>
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    content: { flex: 1, padding: 25, justifyContent: 'center' },

    greeting: { fontSize: 32, fontWeight: 'bold', color: '#f8fafc', marginBottom: 5 },
    subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 40 },

    quoteCard: { backgroundColor: '#1e293b', padding: 25, borderRadius: 16, marginBottom: 30, borderLeftWidth: 4, borderLeftColor: '#38bdf8', elevation: 5 },
    quoteText: { color: '#e2e8f0', fontSize: 16, fontStyle: 'italic', marginBottom: 15, lineHeight: 24 },
    quoteAuthor: { color: '#64748b', fontSize: 14, fontWeight: 'bold', textAlign: 'right' },

    dashboardGrid: { flexDirection: 'row', gap: 15 },
    dashboardItem: { flex: 1, backgroundColor: '#1e293b', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    dashLabel: { color: '#94a3b8', fontSize: 12, marginTop: 5 },
    dashValue: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginTop: 2 }
});