import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, useColorScheme, View, ScrollView } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import {useWindowDimensions} from 'react-native';

interface SensorData {
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  time: string;
}

//feeds object
interface Name {
  created_at: string;
  entry_id: string;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  name: string;
} 

/**interface Response{
  channel: SensorData;
  feeds: any[];
} */

const RadialIcon = ({ color }: { color: string }) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const ticks = Array.from({ length: 60 });

  return (
    <Animated.View style={[styles.gaugeWrapper, animatedStyle]}>
      {ticks.map((_, i) => (
        <View
          key={i}
          style={[
            styles.tick,
            {
              backgroundColor: color,
              transform: [
                { rotate: `${i * 6}deg` },
                { translateY: -65 }
              ],
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

export default function Index() {
  const [data, setData] = useState<SensorData | null>(null);
  const [channel, setChannel] = useState<Name | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(true);
  
//theme colors
const theme = {
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#ccccccff',
    shadow: '#FFFFFF',
  },
  light: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#64748B',
    shadow: '#000000',
  },
};




//API
const currentTheme = isDark ? theme.dark : theme.light;
  const fetchParameter = async () => {
    try {
      const response = await fetch('https://api.thingspeak.com/channels/3259888/feeds.json?api_key=GWJL4NGWE4VRGNH0&results=2');
      const result = await response.json();

      //get the feeds.
      const latestEntry = result.feeds?.at(-1);
      const channel = result.channel;
      setChannel(channel);
     
      
      

      if (latestEntry) {
        setData({
          t1: Number(latestEntry.field1) || 0,
          t2: Number(latestEntry.field2) || 0,
          t3: Number(latestEntry.field3) || 0,
          t4: Number(latestEntry.field4) || 0,
          time: latestEntry.created_at,
        });
      }
    } catch (error) {
      console.error("error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  
//responsiveness
const {width, height} = useWindowDimensions();


  useEffect(()=> {
   fetchParameter();
   const interval = setInterval(() => {
    fetchParameter();
    console.log('i refreshed master');
   }, 5000);
   return () => clearInterval(interval);
  }, []);


  const handleRefresh =() => {
    setLoading(true);
    fetchParameter();
    console.log('i refreshed master')
  };

  function checkTemperature(value: any){
    if (value < 20) {
      return "#2196F3";
    }
    if (value >= 20) {
      return "#4CAF50";
    }
    if (value >= 40) {
      return "#F44336";
    }
    return "#8d8d8d";
  };

  const cardColor = checkTemperature(data?.t1);
  const cardColor2 = checkTemperature(data?.t2);
  const cardColor3 = checkTemperature(data?.t3);
  const cardColor4 = checkTemperature(data?.t4);

  //image import
  const img = require('../assets/images/newlogo.png');
  const spin = require('../assets/images/spinner.gif');
  const email = {
    email: "aowlyfdynamics@gmail.com"
  }
 
return (

  (loading?(<View style={styles.loader}>
    <Image source={spin} style={styles.spinner} />
<Text style={{color: currentTheme.text}}>Loading</Text>
  </View>):(<ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
<StatusBar style={isDark ? 'light' : 'dark'} />
    <View style={styles.head}>
      <View style={styles.logocont}>
        <Image source={img} style={styles.logo} />
        <Text style={[styles.header, { color: currentTheme.text }]}>{channel?.name}</Text>
      </View>
    <Text style={[styles.headersub, { color: currentTheme.textSecondary }]}>Updated: {data?.time.slice(0, 10)}  {data?.time.slice(12, 19)}</Text>
    </View>
 
   {data && (
    <View style={styles.grid}>
      {/**1st sensor */}
      <View style={[styles.card, { backgroundColor: currentTheme.card, shadowColor: currentTheme.shadow }]}>
        <View style={styles.gaugeContainer}>
          <RadialIcon color={cardColor} />
          <Text style={[styles.tempValue, { color: currentTheme.text }]}>{data.t1}°C</Text>
        </View>
        <Text style={[styles.cardLabel, { color: currentTheme.textSecondary }]}>{channel?.field1}</Text>
      </View>

      {/**2nd sensor */}
      <View style={[styles.card, { backgroundColor: currentTheme.card, shadowColor: currentTheme.shadow }]}>
        <View style={styles.gaugeContainer}>
          <RadialIcon color={cardColor2} />
          <Text style={[styles.tempValue, { color: currentTheme.text }]}>{data.t2}°C</Text>
        </View>
        <Text style={[styles.cardLabel, { color: currentTheme.textSecondary }]}>{channel?.field2}</Text>
      </View>

      {/**3rd sensor */}
      <View style={[styles.card, { backgroundColor: currentTheme.card, shadowColor: currentTheme.shadow }]}>
        <View style={styles.gaugeContainer}>
          <RadialIcon color={cardColor3} />
          <Text style={[styles.tempValue, { color: currentTheme.text }]}>{data.t3}°C</Text>
        </View>
        <Text style={[styles.cardLabel, { color: currentTheme.textSecondary }]}>{channel?.field3}</Text>
      </View>

      {/**4th sensor */}
      <View style={[styles.card, { backgroundColor: currentTheme.card, shadowColor: currentTheme.shadow }]}>
        <View style={styles.gaugeContainer}>
          <RadialIcon color={cardColor4} />
          <Text style={[styles.tempValue, { color: currentTheme.text }]}>{data.t4}°C</Text>
        </View>
        <Text style={[styles.cardLabel, { color: currentTheme.textSecondary }]}>{channel?.field4}</Text>
      </View>

      {/**footer part */}
      <View style={styles.logocontfoot}>
        <Image source={img} style={styles.logo} />
        <Text style={[styles.footer, { color: currentTheme.text }]}>{email.email}</Text>
      </View>
    </View>
   )}


  
  </ScrollView>))
)
}
//Add auto refresh every 5 seconds

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  container:{
    flexGrow: 1,
    backgroundColor: '#fff', 
    paddingTop: 60,
    padding: 16,
   
  },
  footer: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7c7c7cff',          
    marginTop: 8,
    textAlign: 'center',
  },
  logocontfoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    marginTop: 80,
    width: '100%',
    
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  logocont: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    
  },
  head:{
    paddingVertical: 10,
    marginBottom: 30,
    width: '100%',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',        
    color: '#000',          
    textAlign: 'center',
  },
  headersub: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',          
    marginTop: 8,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    width: '48%',
    aspectRatio: 0.70,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    // Shadow
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  gaugeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  gaugeWrapper: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tick: {
    position: 'absolute',
    width: 3,
    height: 8,
    borderRadius: 1,
  },
  tempValue: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  //all 
  buttontext: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#605a7c",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
})

// .\gradlew assembleRelease