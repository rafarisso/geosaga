import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const GRAVITY = 2400;
const GROUND_Y = 470;
const STAGE_WIDTH = 2600;
const SAFETY_MARGIN = 24;
const REACH_FACTOR = 0.82;

function parseTs(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  return ts.createSourceFile(
    absolute,
    fs.readFileSync(absolute, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
}

function propertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return undefined;
}

function readValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    const value = Number(node.operand.text);
    return node.operator === ts.SyntaxKind.MinusToken ? -value : value;
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(readValue);
  if (ts.isObjectLiteralExpression(node)) {
    const value = {};
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = propertyName(prop.name);
      if (!key) continue;
      value[key] = readValue(prop.initializer);
    }
    return value;
  }
  return undefined;
}

function readConstObject(source, constName) {
  let initializer;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === constName) {
      initializer = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!initializer) throw new Error(`Could not find ${constName}`);
  return readValue(initializer);
}

function jumpProfile(stats) {
  const maxHeight = (stats.pulo * stats.pulo) / (2 * GRAVITY);
  const airTime = (2 * stats.pulo) / GRAVITY;
  const horizontalReach = stats.velocidade * airTime * REACH_FACTOR;
  return { maxHeight, horizontalReach };
}

function canMoveForward(from, to, profile) {
  const gap = Math.max(0, to.start - from.end);
  if (gap > profile.horizontalReach) return false;
  const climb = Math.max(0, from.y - to.y);
  return climb <= profile.maxHeight + 4;
}

function hasSafeRoute(stage, hazard, profile) {
  const hazardEnd = hazard.x + hazard.width;
  const intervals = [
    {
      id: 'ground-before',
      start: 0,
      end: hazard.x - SAFETY_MARGIN,
      y: GROUND_Y,
    },
    {
      id: 'ground-after',
      start: hazardEnd + SAFETY_MARGIN,
      end: STAGE_WIDTH,
      y: GROUND_Y,
    },
  ];

  for (const [index, platform] of stage.platforms.entries()) {
    const platformEnd = platform.x + platform.width;
    const nearHazard = platformEnd >= hazard.x - profile.horizontalReach
      && platform.x <= hazardEnd + profile.horizontalReach;
    if (!nearHazard) continue;
    intervals.push({
      id: platform.guide ?? `platform-${index + 1}`,
      start: platform.x,
      end: platformEnd,
      y: platform.y,
    });
  }

  intervals.sort((a, b) => a.start - b.start || a.y - b.y);
  const reachable = new Set(['ground-before']);
  let changed = true;

  while (changed) {
    changed = false;
    for (const from of intervals) {
      if (!reachable.has(from.id)) continue;
      for (const to of intervals) {
        if (reachable.has(to.id)) continue;
        if (to.end <= from.start) continue;
        if (!canMoveForward(from, to, profile)) continue;
        reachable.add(to.id);
        changed = true;
      }
    }
  }

  return reachable.has('ground-after');
}

const stages = readConstObject(parseTs('src/data/stages.ts'), 'STAGES');
const characters = readConstObject(parseTs('src/data/characters.ts'), 'CHARACTERS');
const failures = [];

for (const [region, stage] of Object.entries(stages)) {
  const stats = characters[region]?.stats;
  if (!stats) {
    failures.push(`${region}: missing character stats`);
    continue;
  }

  const profile = jumpProfile(stats);
  for (const hazard of stage.hazards) {
    const ok = hasSafeRoute(stage, hazard, profile);
    const label = `${region} / ${hazard.label}`;
    if (ok) {
      console.log(`OK ${label}: route exists`);
    } else {
      failures.push(`${label}: no safe route with jump height ${profile.maxHeight.toFixed(1)}px and reach ${profile.horizontalReach.toFixed(1)}px`);
    }
  }
}

if (failures.length > 0) {
  console.error('\nStage obstacle validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('\nAll stage hazards have a safe route.');
