import StatsManager from '../components/StatsManager';
import { PageHeader } from '../components/Form';

export default function Stats() {
  return (
    <>
      <PageHeader title="Stats" description="Counters shown under the hero buttons." />
      <StatsManager />
    </>
  );
}
