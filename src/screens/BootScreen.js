import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function BootScreen({ onFinish }) {
    const [lineas, setLineas] = useState([]);

    // El guion de tu película de arranque
    const secuencia = [
        "> KAIRO OS v1.0.4",
        "> Initializing Kernel...",
        "> Loading User Data... [OK]",
        "> Checking Financial Modules... [OK]",
        "> Syncing Neural Link... [OK]",
        "> SYSTEM READY.",
        "> Welcome, Nico."
    ];

    useEffect(() => {
        let delay = 0;

        secuencia.forEach((linea, index) => {
            // Tiempos aleatorios para que parezca una máquina real pensando
            const tiempoRandom = Math.floor(Math.random() * 800) + 300;
            delay += tiempoRandom;

            setTimeout(() => {
                setLineas((prev) => [...prev, linea]);
            }, delay);
        });

        // Terminar la secuencia después de la última línea
        setTimeout(() => {
            onFinish(); // Avisamos a App.js que ya terminamos
        }, delay + 1000);

    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View style={styles.terminal}>
                {lineas.map((linea, index) => (
                    <Text key={index} style={styles.text}>
                        {linea}
                    </Text>
                ))}
                {/* El cursor parpadeante clásico */}
                <Text style={styles.cursor}>_</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Negro puro
        justifyContent: 'center',
        padding: 30,
    },
    terminal: {
        gap: 10,
    },
    text: {
        color: '#38bdf8', // Cyan Cyberpunk
        fontFamily: 'monospace', // Letra tipo hacker
        fontSize: 16,
        fontWeight: 'bold',
    },
    cursor: {
        color: '#38bdf8',
        fontSize: 16,
        fontWeight: 'bold',
        opacity: 0.8, // Podríamos animarlo, pero así simple funciona bien
    }
});