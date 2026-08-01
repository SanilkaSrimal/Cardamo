import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Compass, ArrowRight } from 'lucide-react-native';

import { colors, radius, shadow, type as t } from '@/constants/theme';
import { IconTile } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <IconTile size={72} tone="brand" style={styles.icon}>
          <Compass size={32} color={colors.brand600} />
        </IconTile>

        <Text style={styles.title}>This screen doesn&apos;t exist</Text>
        <Text style={styles.message}>
          The page you were looking for may have moved or never existed.
        </Text>

        <Link href="/" style={styles.link}>
          <View style={styles.linkInner}>
            <Text style={styles.linkText}>Go to dashboard</Text>
            <ArrowRight size={16} color={colors.white} />
          </View>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: colors.surface,
  },
  icon: { marginBottom: 22 },
  title: { ...t.display, fontSize: 22, textAlign: 'center' },
  message: { ...t.body, textAlign: 'center', marginTop: 10, maxWidth: 280 },
  link: { marginTop: 26 },
  linkInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand900,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: radius.lg,
    ...shadow.soft,
  },
  linkText: {
    color: colors.white,
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
