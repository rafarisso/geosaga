import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import colossoCurralBoss from '../../assets/bosses/capital-belo-horizonte-boss-colosso-curral.png';
import caosMetropoleBoss from '../../assets/bosses/capital-sao-paulo-boss-caos-metropole.png';
import neblinaAraucariasBoss from '../../assets/bosses/capital-curitiba-boss-neblina-araucarias.png';
import tormentaIlhaBoss from '../../assets/bosses/capital-florianopolis-boss-tormenta-ilha.png';
import crepusculoGuaibaBoss from '../../assets/bosses/capital-porto-alegre-boss-crepusculo-guaiba.png';
import comitivaPlanicieBoss from '../../assets/bosses/capital-campo-grande-boss-comitiva-planicie.png';
import imperadorRessacaBoss from '../../assets/bosses/capital-fortaleza-boss-imperador-ressaca.png';
import fornoPantanalBoss from '../../assets/bosses/capital-cuiaba-boss-forno-pantanal.png';
import eixoCerradoBoss from '../../assets/bosses/capital-brasilia-boss-eixo-cerrado.png';
import regenteCerradoUrbanoBoss from '../../assets/bosses/capital-goiania-boss-regente-cerrado-urbano.png';
import senhorAlagadoBoss from '../../assets/bosses/capital-recife-boss-senhor-alagado.png';
import trovejanteParedaoBoss from '../../assets/bosses/capital-salvador-boss-trovejante-paredao.png';
import sombraBaiaBoss from '../../assets/bosses/capital-rio-boss-sombra-baia.png';
import sentinelaManguezalBoss from '../../assets/bosses/capital-vitoria-boss-sentinela-manguezal.png';
import mareDoMercadoBoss from '../../assets/bosses/capital-belem-boss-mare-do-mercado.png';
import guardiaoAguasEscurasBoss from '../../assets/bosses/capital-manaus-boss-guardiao-aguas-escuras.png';
import sentinelaLavradoBoss from '../../assets/bosses/capital-boa-vista-boss-sentinela-lavrado.png';
import colossoLinhaBoss from '../../assets/bosses/capital-macapa-boss-colosso-linha.png';
import locomotivaMadeiraBoss from '../../assets/bosses/capital-porto-velho-boss-locomotiva-madeira.png';
import seringalSombrioBoss from '../../assets/bosses/capital-rio-branco-boss-seringal-sombrio.png';
import solTocantinsBoss from '../../assets/bosses/capital-palmas-boss-sol-tocantins.png';
import beloHorizonteStageBg from '../../assets/backgrounds/capital-belo-horizonte-stage-bg.png';
import belemStageBg from '../../assets/backgrounds/capital-belem-stage-bg.png';
import manausStageBg from '../../assets/backgrounds/capital-manaus-stage-bg.png';
import boaVistaStageBg from '../../assets/backgrounds/capital-boa-vista-stage-bg.png';
import macapaStageBg from '../../assets/backgrounds/capital-macapa-stage-bg.png';
import portoVelhoStageBg from '../../assets/backgrounds/capital-porto-velho-stage-bg.png';
import rioBrancoStageBg from '../../assets/backgrounds/capital-rio-branco-stage-bg.png';
import palmasStageBg from '../../assets/backgrounds/capital-palmas-stage-bg.png';
import curitibaStageBg from '../../assets/backgrounds/capital-curitiba-stage-bg.png';
import florianopolisStageBg from '../../assets/backgrounds/capital-florianopolis-stage-bg.png';
import fortalezaStageBg from '../../assets/backgrounds/capital-fortaleza-stage-bg.png';
import portoAlegreStageBg from '../../assets/backgrounds/capital-porto-alegre-stage-bg.png';
import brasiliaStageBg from '../../assets/backgrounds/capital-brasilia-stage-bg.png';
import campoGrandeStageBg from '../../assets/backgrounds/capital-campo-grande-stage-bg.png';
import cuiabaStageBg from '../../assets/backgrounds/capital-cuiaba-stage-bg.png';
import goianiaStageBg from '../../assets/backgrounds/capital-goiania-stage-bg.png';
import recifeStageBg from '../../assets/backgrounds/capital-recife-stage-bg.png';
import rioStageBg from '../../assets/backgrounds/capital-rio-de-janeiro-stage-bg.png';
import salvadorStageBg from '../../assets/backgrounds/capital-salvador-stage-bg.png';
import saoPauloStageBg from '../../assets/backgrounds/capital-sao-paulo-stage-bg.png';
import vitoriaStageBg from '../../assets/backgrounds/capital-vitoria-stage-bg.png';
import brasiliaAsfaltoEnemy from '../../assets/enemies/capital-brasilia-enemy-asfalto-vermelho.png';
import brasiliaCanalEnemy from '../../assets/enemies/capital-brasilia-enemy-canal-paranoa.png';
import brasiliaEixoEnemy from '../../assets/enemies/capital-brasilia-enemy-eixo-congestionado.png';
import brasiliaPoeiraEnemy from '../../assets/enemies/capital-brasilia-enemy-poeira-cerrado.png';
import campoGrandeCalorEnemy from '../../assets/enemies/capital-campo-grande-enemy-calor-avenida.png';
import campoGrandeCorregoEnemy from '../../assets/enemies/capital-campo-grande-enemy-corrego-sufocado.png';
import campoGrandePoeiraEnemy from '../../assets/enemies/capital-campo-grande-enemy-poeira-planicie.png';
import campoGrandeRotatoriaEnemy from '../../assets/enemies/capital-campo-grande-enemy-rotatoria-travada.png';
import cuiabaBafoEnemy from '../../assets/enemies/capital-cuiaba-enemy-bafo-calor.png';
import cuiabaFumacaEnemy from '../../assets/enemies/capital-cuiaba-enemy-fumaca-cerrado.png';
import cuiabaPonteEnemy from '../../assets/enemies/capital-cuiaba-enemy-ponte-travada.png';
import cuiabaRioEnemy from '../../assets/enemies/capital-cuiaba-enemy-rio-assoreado.png';
import fortalezaDunaEnemy from '../../assets/enemies/capital-fortaleza-enemy-duna-avancando.png';
import fortalezaOrlaEnemy from '../../assets/enemies/capital-fortaleza-enemy-orla-lotada.png';
import fortalezaRessacaEnemy from '../../assets/enemies/capital-fortaleza-enemy-ressaca-urbana.png';
import fortalezaVentoEnemy from '../../assets/enemies/capital-fortaleza-enemy-vento-cortante.png';
import goianiaAvenidaEnemy from '../../assets/enemies/capital-goiania-enemy-avenida-travada.png';
import goianiaBrumaEnemy from '../../assets/enemies/capital-goiania-enemy-bruma-seca.png';
import goianiaCalorEnemy from '../../assets/enemies/capital-goiania-enemy-ilha-calor-verde.png';
import goianiaCorregoEnemy from '../../assets/enemies/capital-goiania-enemy-corrego-canalizado.png';
import recifeMangueEnemy from '../../assets/enemies/capital-recife-enemy-mangue-contaminado.png';
import recifeMormacoEnemy from '../../assets/enemies/capital-recife-enemy-mormaco-urbano.png';
import recifeOndaEnemy from '../../assets/enemies/capital-recife-enemy-onda-capibaribe.png';
import recifePonteEnemy from '../../assets/enemies/capital-recife-enemy-ponte-travada.png';
import carroParedaoEnemy from '../../assets/enemies/capital-salvador-enemy-carro-paredao.png';
import ladeiraTravadaEnemy from '../../assets/enemies/capital-salvador-enemy-ladeira-travada.png';
import mareBaiaEnemy from '../../assets/enemies/capital-salvador-enemy-mare-baia.png';
import ondaGraveEnemy from '../../assets/enemies/capital-salvador-enemy-onda-grave.png';
import belemBarcoLotadoEnemy from '../../assets/enemies/capital-belem-enemy-barco-lotado.png';
import belemCanalContaminadoEnemy from '../../assets/enemies/capital-belem-enemy-canal-contaminado.png';
import belemChuvaRepentinaEnemy from '../../assets/enemies/capital-belem-enemy-chuva-repentina.png';
import belemMareCruzadaEnemy from '../../assets/enemies/capital-belem-enemy-mare-cruzada.png';
import manausCalorUmidoEnemy from '../../assets/enemies/capital-manaus-enemy-calor-umido.png';
import manausEncontroTurvoEnemy from '../../assets/enemies/capital-manaus-enemy-encontro-turvo.png';
import manausIgarapeSufocadoEnemy from '../../assets/enemies/capital-manaus-enemy-igarape-sufocado.png';
import manausPortoEnferrujadoEnemy from '../../assets/enemies/capital-manaus-enemy-porto-enferrujado.png';
import boaVistaAvenidaRadialEnemy from '../../assets/enemies/capital-boa-vista-enemy-avenida-radial.png';
import boaVistaFronteiraNebulosaEnemy from '../../assets/enemies/capital-boa-vista-enemy-fronteira-nebulosa.png';
import boaVistaPoeiraLavradoEnemy from '../../assets/enemies/capital-boa-vista-enemy-poeira-lavrado.png';
import boaVistaRioBrancoSecanteEnemy from '../../assets/enemies/capital-boa-vista-enemy-rio-branco-secante.png';
import macapaLamaVarzeaEnemy from '../../assets/enemies/capital-macapa-enemy-lama-varzea.png';
import macapaLinhaEquadorEnemy from '../../assets/enemies/capital-macapa-enemy-linha-equador.png';
import macapaMuralhaEncharcadaEnemy from '../../assets/enemies/capital-macapa-enemy-muralha-encharcada.png';
import macapaRessacaAmazonicaEnemy from '../../assets/enemies/capital-macapa-enemy-ressaca-amazonica.png';
import portoVelhoCorrenteMadeiraEnemy from '../../assets/enemies/capital-porto-velho-enemy-corrente-madeira.png';
import portoVelhoFumacaLogisticaEnemy from '../../assets/enemies/capital-porto-velho-enemy-fumaca-logistica.png';
import portoVelhoGuindasteFantasmaEnemy from '../../assets/enemies/capital-porto-velho-enemy-guindaste-fantasma.png';
import portoVelhoTrilhoTorcidoEnemy from '../../assets/enemies/capital-porto-velho-enemy-trilho-torcido.png';
import rioBrancoChuvaFronteiraEnemy from '../../assets/enemies/capital-rio-branco-enemy-chuva-fronteira.png';
import rioBrancoPassarelaFantasmaEnemy from '../../assets/enemies/capital-rio-branco-enemy-passarela-fantasma.png';
import rioBrancoRioAcreBarrentoEnemy from '../../assets/enemies/capital-rio-branco-enemy-rio-acre-barrento.png';
import rioBrancoSeringueiraVivaEnemy from '../../assets/enemies/capital-rio-branco-enemy-seringueira-viva.png';
import palmasAvenidaPlanejadaEnemy from '../../assets/enemies/capital-palmas-enemy-avenida-planejada.png';
import palmasCalorCerradoEnemy from '../../assets/enemies/capital-palmas-enemy-calor-cerrado.png';
import palmasLagoInquietoEnemy from '../../assets/enemies/capital-palmas-enemy-lago-inquieto.png';
import palmasVentoSerraEnemy from '../../assets/enemies/capital-palmas-enemy-vento-serra.png';
import { CHARACTERS } from '../../data/characters';
import type { CapitalMission } from '../../data/capitalChallenges';
import { CAPITAL_SPECIAL_QUESTIONS, type CapitalSpecialQuestion } from '../../data/capitalQuestions';
import type { CapitalId, CapitalMissionResult, RegionId } from '../../data/types';
import { isMuted, playSound, setMuted } from '../../game/soundEngine';
import { useDeviceMode } from '../../hooks/useDeviceMode';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { shuffleQuestionChoices, type AnswerIndex } from '../../utils/questionChoices';
import { MobileControls } from './MobileControls';
import { Player } from './Player';
import {
  CAPITAL_BOSS_H,
  CAPITAL_BOSS_W,
  CAPITAL_ENEMY_SIZE,
  CAPITAL_GUARDIAN_BOOSTS,
  CAPITAL_MAX_ENERGY,
  CAPITAL_PLAYER_H,
  CAPITAL_PLAYER_W,
  CAPITAL_STAGE_W,
  CAPITAL_VIEW_H,
  CAPITAL_VIEW_W,
  CapitalStageEngine,
  getCapitalStageDefinition,
  type CapitalStageView,
} from './capitalStageEngine';

type Phase = 'intro' | 'playing' | 'quiz' | 'victory' | 'defeat';

interface SpecialEffect {
  id: number;
  x: number;
  y: number;
  facing: 1 | -1;
}

const GUARDIAN_ORDER: RegionId[] = ['sudeste', 'norte', 'centro-oeste', 'nordeste', 'sul'];

function defaultGuardianForRoute(route: CapitalMission['route']): RegionId {
  if (route === 'sul') return 'sul';
  if (route === 'centro-oeste') return 'centro-oeste';
  if (route === 'nordeste') return 'nordeste';
  if (route === 'norte') return 'norte';
  return 'sudeste';
}
const CAPITAL_STAGE_BACKGROUNDS: Partial<Record<CapitalId, string>> = {
  'sao-paulo': saoPauloStageBg,
  'rio-de-janeiro': rioStageBg,
  'belo-horizonte': beloHorizonteStageBg,
  vitoria: vitoriaStageBg,
  curitiba: curitibaStageBg,
  florianopolis: florianopolisStageBg,
  'porto-alegre': portoAlegreStageBg,
  brasilia: brasiliaStageBg,
  goiania: goianiaStageBg,
  cuiaba: cuiabaStageBg,
  'campo-grande': campoGrandeStageBg,
  salvador: salvadorStageBg,
  recife: recifeStageBg,
  fortaleza: fortalezaStageBg,
  belem: belemStageBg,
  manaus: manausStageBg,
  'boa-vista': boaVistaStageBg,
  macapa: macapaStageBg,
  'porto-velho': portoVelhoStageBg,
  'rio-branco': rioBrancoStageBg,
  palmas: palmasStageBg,
};
const CAPITAL_ENEMY_IMAGES: Partial<Record<string, string>> = {
  'df-axis-flow': brasiliaEixoEnemy,
  'df-dry-haze': brasiliaPoeiraEnemy,
  'df-paranoa-water': brasiliaCanalEnemy,
  'df-heat-island': brasiliaAsfaltoEnemy,
  'go-avenida-travada': goianiaAvenidaEnemy,
  'go-bruma-seca': goianiaBrumaEnemy,
  'go-corrego-canalizado': goianiaCorregoEnemy,
  'go-ilha-calor-verde': goianiaCalorEnemy,
  'mt-bafo-calor': cuiabaBafoEnemy,
  'mt-rio-assoreado': cuiabaRioEnemy,
  'mt-fumaca-cerrado': cuiabaFumacaEnemy,
  'mt-ponte-travada': cuiabaPonteEnemy,
  'ms-rotatoria-travada': campoGrandeRotatoriaEnemy,
  'ms-corrego-sufocado': campoGrandeCorregoEnemy,
  'ms-poeira-planicie': campoGrandePoeiraEnemy,
  'ms-calor-avenida': campoGrandeCalorEnemy,
  'ba-soundcar': carroParedaoEnemy,
  'ba-soundwave': ondaGraveEnemy,
  'ba-tide': mareBaiaEnemy,
  'ba-slope': ladeiraTravadaEnemy,
  'pe-onda-capibaribe': recifeOndaEnemy,
  'pe-ponte-travada': recifePonteEnemy,
  'pe-mangue-contaminado': recifeMangueEnemy,
  'pe-mormaco-urbano': recifeMormacoEnemy,
  'ce-ressaca-urbana': fortalezaRessacaEnemy,
  'ce-vento-cortante': fortalezaVentoEnemy,
  'ce-orla-lotada': fortalezaOrlaEnemy,
  'ce-duna-avancando': fortalezaDunaEnemy,
  'pa-mare-cruzada': belemMareCruzadaEnemy,
  'pa-barco-lotado': belemBarcoLotadoEnemy,
  'pa-chuva-repentina': belemChuvaRepentinaEnemy,
  'pa-canal-contaminado': belemCanalContaminadoEnemy,
  'am-encontro-turvo': manausEncontroTurvoEnemy,
  'am-porto-enferrujado': manausPortoEnferrujadoEnemy,
  'am-calor-umido': manausCalorUmidoEnemy,
  'am-igarape-sufocado': manausIgarapeSufocadoEnemy,
  'rr-avenida-radial': boaVistaAvenidaRadialEnemy,
  'rr-rio-branco-secante': boaVistaRioBrancoSecanteEnemy,
  'rr-poeira-lavrado': boaVistaPoeiraLavradoEnemy,
  'rr-fronteira-nebulosa': boaVistaFronteiraNebulosaEnemy,
  'ap-linha-equador': macapaLinhaEquadorEnemy,
  'ap-muralha-encharcada': macapaMuralhaEncharcadaEnemy,
  'ap-ressaca-amazonica': macapaRessacaAmazonicaEnemy,
  'ap-lama-varzea': macapaLamaVarzeaEnemy,
  'ro-trilho-torcido': portoVelhoTrilhoTorcidoEnemy,
  'ro-corrente-madeira': portoVelhoCorrenteMadeiraEnemy,
  'ro-guindaste-fantasma': portoVelhoGuindasteFantasmaEnemy,
  'ro-fumaca-logistica': portoVelhoFumacaLogisticaEnemy,
  'ac-rio-acre-barrento': rioBrancoRioAcreBarrentoEnemy,
  'ac-seringueira-viva': rioBrancoSeringueiraVivaEnemy,
  'ac-passarela-fantasma': rioBrancoPassarelaFantasmaEnemy,
  'ac-chuva-fronteira': rioBrancoChuvaFronteiraEnemy,
  'to-calor-cerrado': palmasCalorCerradoEnemy,
  'to-lago-inquieto': palmasLagoInquietoEnemy,
  'to-avenida-planejada': palmasAvenidaPlanejadaEnemy,
  'to-vento-serra': palmasVentoSerraEnemy,
};
const CAPITAL_STAGE_BOSS_IMAGES: Partial<Record<CapitalId, string>> = {
  'sao-paulo': caosMetropoleBoss,
  'rio-de-janeiro': sombraBaiaBoss,
  'belo-horizonte': colossoCurralBoss,
  vitoria: sentinelaManguezalBoss,
  curitiba: neblinaAraucariasBoss,
  florianopolis: tormentaIlhaBoss,
  'porto-alegre': crepusculoGuaibaBoss,
  brasilia: eixoCerradoBoss,
  goiania: regenteCerradoUrbanoBoss,
  cuiaba: fornoPantanalBoss,
  'campo-grande': comitivaPlanicieBoss,
  salvador: trovejanteParedaoBoss,
  recife: senhorAlagadoBoss,
  fortaleza: imperadorRessacaBoss,
  belem: mareDoMercadoBoss,
  manaus: guardiaoAguasEscurasBoss,
  'boa-vista': sentinelaLavradoBoss,
  macapa: colossoLinhaBoss,
  'porto-velho': locomotivaMadeiraBoss,
  'rio-branco': seringalSombrioBoss,
  palmas: solTocantinsBoss,
};

interface CapitalPlayableStageProps {
  mission: CapitalMission;
  completed: boolean;
  onComplete: (result: CapitalMissionResult) => void;
}

function shuffleQuestions(items: CapitalSpecialQuestion[]): CapitalSpecialQuestion[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    const current = copy[index]!;
    copy[index] = copy[target]!;
    copy[target] = current;
  }
  return copy;
}

export function CapitalPlayableStage({ mission, completed, onComplete }: CapitalPlayableStageProps) {
  const defaultGuardian = defaultGuardianForRoute(mission.route);
  const [guardian, setGuardian] = useState<RegionId>(defaultGuardian);
  const [engine, setEngine] = useState(() => new CapitalStageEngine(defaultGuardian, mission.id));
  const [view, setView] = useState<CapitalStageView>(() => engine.view());
  const [phase, setPhase] = useState<Phase>('intro');
  const [specialQuestion, setSpecialQuestion] = useState<CapitalSpecialQuestion | null>(null);
  const [specialEffect, setSpecialEffect] = useState<SpecialEffect | null>(null);
  const [stars, setStars] = useState(0);
  const [muted, setMutedState] = useState(isMuted());
  const renderElapsedRef = useRef(0);
  const specialEffectIdRef = useRef(0);
  const victorySavedRef = useRef(false);
  const sfxRef = useRef({ hp: view.hp, enemies: view.enemies.length, objectives: view.objectiveCount, boss: false });
  const questionDeckRef = useRef<CapitalSpecialQuestion[]>([]);
  const lastQuestionIdRef = useRef<string | null>(null);
  const lastAnswerIndexRef = useRef<AnswerIndex | null>(null);

  const { isTouch, isPortrait } = useDeviceMode();
  const needsRotate = isTouch && isPortrait;
  const active = phase === 'playing' && !needsRotate;
  const { inputRef, setButton } = useKeyboardControls(active);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const stageDefinition = getCapitalStageDefinition(mission.id);
  const backgroundImage = CAPITAL_STAGE_BACKGROUNDS[mission.id] ?? saoPauloStageBg;
  const bossImage = CAPITAL_STAGE_BOSS_IMAGES[mission.id] ?? caosMetropoleBoss;

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      setScale(Math.min(width / CAPITAL_VIEW_W, height / CAPITAL_VIEW_H));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    if (!specialEffect) return undefined;
    const timeout = window.setTimeout(() => setSpecialEffect(null), 720);
    return () => window.clearTimeout(timeout);
  }, [specialEffect]);
  const worldStyle = useMemo(
    () => {
      const touchLift = isTouch && !needsRotate ? Math.min(128, Math.max(0, (1 - scale) * 390)) : 0;
      return { width: CAPITAL_VIEW_W, height: CAPITAL_VIEW_H, transform: `translateY(${-touchLift}px) scale(${scale})` };
    },
    [isTouch, needsRotate, scale],
  );

  function reset(nextGuardian = defaultGuardian) {
    const fresh = new CapitalStageEngine(nextGuardian, mission.id);
    setGuardian(nextGuardian);
    setEngine(fresh);
    setView(fresh.view());
    setPhase('intro');
    setSpecialQuestion(null);
    setSpecialEffect(null);
    setStars(0);
    victorySavedRef.current = false;
    sfxRef.current = { hp: fresh.view().hp, enemies: fresh.view().enemies.length, objectives: 0, boss: false };
    renderElapsedRef.current = 0;
    lastAnswerIndexRef.current = null;
  }

  function chooseGuardian(next: RegionId) {
    reset(next);
  }

  async function enterImmersiveMode() {
    if (!isTouch) return;
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (value: 'landscape') => Promise<void>;
      };
      await orientation.lock?.('landscape');
    } catch {
      // Nem todo navegador permite tela cheia/orientacao travada.
    }
  }

  function startMission() {
    setPhase('playing');
    void enterImmersiveMode();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  function exitStage() {
    reset();
  }

  function emitSfx(next: CapitalStageView) {
    if (next.hp < sfxRef.current.hp) playSound('hurt');
    if (next.enemies.length < sfxRef.current.enemies) playSound('defeatEnemy');
    if (next.objectiveCount > sfxRef.current.objectives) playSound('pickup');
    if (next.boss && !sfxRef.current.boss) playSound('bossAppear');
    sfxRef.current = {
      hp: next.hp,
      enemies: next.enemies.length,
      objectives: next.objectiveCount,
      boss: Boolean(next.boss),
    };
  }

  function drawSpecialQuestion(): CapitalSpecialQuestion {
    const bank = CAPITAL_SPECIAL_QUESTIONS[mission.id].length > 0
      ? CAPITAL_SPECIAL_QUESTIONS[mission.id]
      : CAPITAL_SPECIAL_QUESTIONS['sao-paulo'];
    if (questionDeckRef.current.length === 0) {
      const withoutImmediateRepeat = bank.filter((item) => item.id !== lastQuestionIdRef.current);
      questionDeckRef.current = shuffleQuestions(withoutImmediateRepeat.length > 0 ? withoutImmediateRepeat : bank);
    }
    const next = questionDeckRef.current.pop() ?? bank[0]!;
    lastQuestionIdRef.current = next.id;
    const shuffled = shuffleQuestionChoices(next, lastAnswerIndexRef.current);
    lastAnswerIndexRef.current = shuffled.answerIndex;
    return shuffled;
  }

  function handleStep(dt: number): boolean {
    const outcome = engine.step(dt, inputRef.current);
    if (outcome === 'requestSpecial') {
      setSpecialQuestion(drawSpecialQuestion());
      setView(engine.view());
      setPhase('quiz');
      return false;
    }
    if (outcome === 'victory') {
      const nextStars = engine.starsEarned();
      setStars(nextStars);
      setView(engine.view());
      playSound('victory');
      setPhase('victory');
      return false;
    }
    if (outcome === 'defeat') {
      setView(engine.view());
      playSound('gameover');
      setPhase('defeat');
      return false;
    }
    renderElapsedRef.current += dt;
    if (renderElapsedRef.current >= 1 / 30) {
      renderElapsedRef.current = 0;
      const next = engine.view();
      emitSfx(next);
      setView(next);
    }
    return true;
  }

  useGameLoop(handleStep, active);

  useEffect(() => {
    if (phase !== 'victory' || victorySavedRef.current) return;
    victorySavedRef.current = true;
    onComplete({
      capital: mission.id,
      route: mission.route,
      score: engine.currentScore,
      stars,
      completed: true,
    });
  }, [engine, mission.id, mission.route, onComplete, phase, stars]);

  function answer(index: number) {
    if (!specialQuestion) return;
    const correct = index === specialQuestion.answerIndex;
    engine.applySpecial(correct);
    playSound(correct ? 'special' : 'hurt');
    const nextView = engine.view();
    if (correct) {
      specialEffectIdRef.current += 1;
      setSpecialEffect({
        id: specialEffectIdRef.current,
        x: nextView.px + CAPITAL_PLAYER_W / 2 + nextView.pfacing * 42,
        y: nextView.pfeet - CAPITAL_PLAYER_H * 0.54,
        facing: nextView.pfacing,
      });
    } else {
      setSpecialEffect(null);
    }
    setView(nextView);
    setSpecialQuestion(null);
    setPhase('playing');
  }

  const character = CHARACTERS[guardian];
  const energyRatio = Math.max(0, Math.min(1, view.energy / CAPITAL_MAX_ENERGY));
  const hpRatio = Math.max(0, view.hp / view.maxHp);
  const bossRatio = view.boss ? Math.max(0, view.boss.hp / view.boss.maxHp) : 0;

  return (
    <section
      className="capital-play-root"
      style={{
        '--capital-stage-bg': `url(${backgroundImage})`,
        '--region-color': character.themeColor,
      } as CSSProperties}
    >
      <div className={`capital-play-viewport ${specialEffect ? 'special-active' : ''}`} ref={viewportRef}>
        <div className="capital-play-scaler" style={worldStyle}>
          <div className="capital-play-world" style={{ transform: `translateX(${-view.camera}px)` }}>
            <div className="capital-play-backdrop" style={{ width: CAPITAL_STAGE_W }} />
            <div className="capital-play-atmosphere" style={{ width: CAPITAL_STAGE_W }} />
            <div className="capital-play-ground" style={{ width: CAPITAL_STAGE_W }} />
            <div className="capital-play-finish" style={{ left: CAPITAL_STAGE_W - 250 }}>
              <strong>Marco final</strong>
              <span>{stageDefinition.finishLabel}</span>
            </div>

            {view.objectives.map((objective) => (
              <div
                className={`capital-objective ${objective.collected ? 'collected' : ''}`}
                key={objective.id}
                style={{ left: objective.x, top: objective.y }}
              >
                <span>{objective.collected ? '✓' : '◆'}</span>
                <strong>{objective.label}</strong>
                <small>{objective.concept}</small>
              </div>
            ))}

            {view.enemies.map((enemy) => {
              const ratio = Math.max(0, enemy.hp / enemy.maxHp);
              const offset = enemy.shake > 0 ? Math.sin(enemy.shake * 70) * 5 : 0;
              const enemyImage = CAPITAL_ENEMY_IMAGES[enemy.id];
              return (
                <div
                  className={`capital-enemy capital-enemy-${enemy.kind} capital-enemy-id-${enemy.id} ${enemyImage ? 'has-image' : ''} ${enemy.slowed ? 'slowed' : ''}`}
                  key={enemy.id}
                  style={{
                    left: enemy.x,
                    top: enemy.feetY - CAPITAL_ENEMY_SIZE,
                    width: CAPITAL_ENEMY_SIZE,
                    height: CAPITAL_ENEMY_SIZE,
                    transform: `translateX(${offset}px)`,
                    filter: enemy.hitFlash > 0 ? 'brightness(2.1) saturate(0.5)' : undefined,
                  }}
                  role="img"
                  aria-label={enemy.name}
                >
                  {enemyImage ? <img className="capital-enemy-image" src={enemyImage} alt="" aria-hidden /> : null}
                  <span className="capital-enemy-core" />
                  <span className="capital-enemy-face" />
                  <div className="capital-enemy-health"><span style={{ width: `${ratio * 100}%` }} /></div>
                  <strong>{enemy.name}</strong>
                  <small>{enemy.concept}</small>
                </div>
              );
            })}

            {view.boss && (
              <div
                className={`capital-boss ${view.boss.charging ? 'charging' : ''} ${view.boss.enraged ? 'enraged' : ''}`}
                style={{
                  left: view.boss.x,
                  top: view.boss.feetY - CAPITAL_BOSS_H,
                  width: CAPITAL_BOSS_W,
                  height: CAPITAL_BOSS_H,
                  transform: `translateX(${view.boss.shake > 0 ? Math.sin(view.boss.shake * 70) * 7 : 0}px)`,
                  filter: view.boss.hitFlash > 0 ? 'brightness(2.1) saturate(0.5)' : undefined,
                }}
              >
                <span className="capital-boss-core" />
                <span className="capital-boss-ring" />
                <img className="capital-boss-image" src={bossImage} alt="" aria-hidden />
                <strong>{view.boss.name}</strong>
              </div>
            )}

            {view.pickups.map((pickup) => (
              <span
                className={`capital-pickup capital-pickup-${pickup.kind}`}
                key={pickup.id}
                style={{ left: pickup.x, top: pickup.y }}
              >
                {pickup.kind === 'heal' ? '♥' : pickup.kind === 'boost' ? '⚡' : '★'}
              </span>
            ))}

            <Player
              region={guardian}
              state={view.pstate}
              facing={view.pfacing}
              x={view.px}
              feetY={view.pfeet}
              width={CAPITAL_PLAYER_W}
              height={CAPITAL_PLAYER_H}
              blinking={view.blinking}
              guarding={view.guarding}
              guardFlash={view.guardFlash}
            />

            {specialEffect && (
              <div
                className={`capital-special-burst ${specialEffect.facing === -1 ? 'facing-left' : 'facing-right'}`}
                key={specialEffect.id}
                style={{ left: specialEffect.x, top: specialEffect.y }}
              >
                <span className="capital-special-burst-beam" />
                <span className="capital-special-burst-core" />
                <span className="capital-special-burst-ring ring-one" />
                <span className="capital-special-burst-ring ring-two" />
              </div>
            )}

            {view.projectiles.map((projectile) => (
              <span
                className={`capital-projectile capital-projectile-${projectile.team}`}
                key={projectile.id}
                style={{
                  left: projectile.x - projectile.r,
                  top: projectile.y - projectile.r,
                  width: projectile.r * 2,
                  height: projectile.r * 2,
                  '--proj-color': projectile.color,
                } as CSSProperties}
              />
            ))}

            {view.particles.map((particle) => (
              <span
                className={`capital-particle capital-particle-${particle.kind}`}
                key={particle.id}
                style={{
                  left: particle.x,
                  top: particle.y,
                  opacity: particle.alpha,
                  color: particle.color,
                  transform: `translate(-50%, -50%) scale(${particle.scale})`,
                  '--spark-color': particle.color,
                } as CSSProperties}
              >
                {particle.text}
              </span>
            ))}
          </div>
        </div>

        {specialEffect && <div className="capital-special-screen-flash" key={`flash-${specialEffect.id}`} />}

        {view.combo >= 2 && (
          <div className="capital-combo" role="status">
            <strong>Combo urbano x{view.comboMultiplier}</strong>
            <span>{view.combo} restauracoes em sequencia</span>
          </div>
        )}

        {view.bossGate && (
          <div className="capital-stage-hint">
            {stageDefinition.gateHint}
          </div>
        )}
      </div>

      <div className="capital-play-hud">
        <div className="capital-hud-bars">
          <span className="capital-hud-name">{character.name} em {stageDefinition.city}</span>
          <div className="stage-bar stage-bar-health">
            <span style={{ width: `${hpRatio * 100}%` }} />
            <small>♥ {Math.max(0, Math.round(view.hp))}</small>
          </div>
          <div className={`stage-bar stage-bar-energy ${energyRatio >= 1 ? 'ready' : ''}`}>
            <span style={{ width: `${energyRatio * 100}%` }} />
            <small>{energyRatio >= 1 ? 'Poder geografico pronto' : 'Foco geografico'}</small>
          </div>
        </div>
        <div className="capital-hud-meta">
          <div>
            <span>Marcos</span>
            <strong>{view.objectiveCount}/{view.totalObjectives}</strong>
          </div>
          <div>
            <span>Pontos</span>
            <strong>{view.score}</strong>
          </div>
          <button className="stage-icon-btn" onClick={toggleMute}>{muted ? '🔇' : '🔊'}</button>
          <button className="stage-icon-btn" onClick={exitStage}>Sair</button>
        </div>
        {view.boss && (
          <div className={`capital-boss-hud ${view.boss.enraged ? 'enraged' : ''}`}>
            <span>{view.boss.name}</span>
            <div className="stage-bar stage-bar-boss">
              <span style={{ width: `${bossRatio * 100}%` }} />
              <small>Use o poder geografico para finalizar</small>
            </div>
          </div>
        )}
      </div>

      {isTouch && !needsRotate && (
        <MobileControls
          setButton={setButton}
          attackVerb="Purificar"
          specialVerb="Poder Geo"
          specialReady={energyRatio >= 1}
        />
      )}

      {needsRotate && (
        <div className="stage-rotate" role="alertdialog" aria-label="Gire o celular">
          <div className="stage-rotate-card">
            <span className="stage-rotate-icon" aria-hidden>📱↻</span>
            <h2>Gire o celular</h2>
            <p>A campanha das capitais foi pensada para jogar na horizontal.</p>
            <div className="stage-overlay-actions">
              <button className="btn-primary" onClick={() => void enterImmersiveMode()}>Usar tela cheia</button>
              <button className="btn-secondary" onClick={exitStage}>Voltar</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-intro-card">
            <span className="eyebrow">{completed ? 'Rejogar capital' : 'Nova campanha jogavel'}</span>
            <h2>{stageDefinition.introTitle}</h2>
            <p className="stage-overlay-objective">
              {stageDefinition.introObjective}
            </p>
            <div className="capital-guardian-select" aria-label="Escolha seu guardiao">
              {GUARDIAN_ORDER.map((id) => (
                <button
                  className={id === guardian ? 'active' : ''}
                  key={id}
                  type="button"
                  onClick={() => chooseGuardian(id)}
                >
                  <span>{CHARACTERS[id].name}</span>
                  <small>{CAPITAL_GUARDIAN_BOOSTS[id].label}</small>
                </button>
              ))}
            </div>
            <ul className="stage-controls-help">
              <li><strong>A/D</strong> ou <strong>←/→</strong> mover · <strong>Espaco</strong> pular</li>
              <li><strong>S/↓</strong> abaixar e defender tiros baixos · <strong>J</strong> atacar</li>
              <li><strong>K</strong> ativa o Poder Geo: responda para causar dano forte</li>
            </ul>
            <button className="btn-primary btn-large" onClick={startMission}>Entrar na fase</button>
          </div>
        </div>
      )}

      {phase === 'quiz' && specialQuestion && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-quiz-card">
            <span className="eyebrow">Poder geografico</span>
            <h2>{specialQuestion.statement}</h2>
            <div className="capital-quiz-options">
              {specialQuestion.choices.map((choice, index) => (
                <button key={choice} type="button" onClick={() => answer(index)}>
                  {choice}
                </button>
              ))}
            </div>
            <p>{specialQuestion.explanation}</p>
          </div>
        </div>
      )}

      {phase === 'victory' && (
        <div className="stage-overlay stage-overlay-victory">
          <div className="stage-overlay-card">
            <span className="eyebrow">Capital restaurada</span>
            <h2>{stageDefinition.victoryTitle}</h2>
            <div className="stage-stars" aria-label={`${stars} de 3 estrelas`}>
              {[1, 2, 3].map((n) => <span className={n <= stars ? 'star on' : 'star'} key={n}>★</span>)}
            </div>
            <p>{stageDefinition.victoryBody}</p>
            <div className="stage-result-score">
              <strong>{view.score}</strong>
              <span>pontos</span>
            </div>
            <div className="stage-overlay-actions">
              <button className="btn-secondary" onClick={() => reset()}>Jogar de novo</button>
              <button className="btn-primary btn-large" onClick={exitStage}>Voltar a rota</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'defeat' && (
        <div className="stage-overlay stage-overlay-defeat">
          <div className="stage-overlay-card">
            <span className="eyebrow">Tente outra estrategia</span>
            <h2>{character.name} perdeu o foco</h2>
            <p>Use a defesa baixa contra tiros, colete marcos e escolha um guardiao com poder adequado para a cidade.</p>
            <div className="stage-overlay-actions">
              <button className="btn-secondary" onClick={exitStage}>Voltar</button>
              <button className="btn-primary btn-large" onClick={() => reset()}>Tentar de novo</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
