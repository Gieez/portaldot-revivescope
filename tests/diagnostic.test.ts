import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePot, formatPot, calculateDecimalSkew } from '../src/lib/math';
import { isValidH160, deriveSubstrateAddress } from '../src/lib/substrate-address';
import { PORTALDOT_CHAIN_SPECS } from '../src/lib/chains';

test('14-Decimal Safe Math: parsePot and formatPot', () => {
  const onePot = parsePot('1.0');
  assert.equal(onePot, 100000000000000n, '1 POT must equal 10^14 base units');

  const fractional = parsePot('0.05');
  assert.equal(fractional, 5000000000000n, '0.05 POT must equal 5*10^12 base units');

  assert.equal(formatPot(onePot), '1.00');
  assert.equal(formatPot(fractional), '0.05');

  const skew = calculateDecimalSkew('1.0');
  assert.equal(skew.skewRatio, 10000, 'Standard EVM skew ratio must be exactly 10,000x');
  assert.equal(skew.standard18Base, 1000000000000000000n, '18-decimal base must be 10^18');
  assert.equal(skew.portaldot14Base, 100000000000000n, 'Portaldot base must be 10^14');
});

test('Address Mapper: H160 validation and SS58 derivation', () => {
  const validDeployer = '0xf7eC65d11e35375A250e474059a917B537804142';
  assert.equal(isValidH160(validDeployer), true);
  assert.equal(isValidH160('0xinvalid'), false);

  const officialSs58 = deriveSubstrateAddress(validDeployer);
  assert.equal(
    officialSs58,
    '5Hfmuhj1AHrTBJiC9zUPnJo1cfG2G52LLMwofSigBnjtto8Y',
    'Must match official guide testnet SS58 mapping'
  );
});

test('Chain Specifications: Portaldot V3 config', () => {
  assert.equal(PORTALDOT_CHAIN_SPECS.chainId, 420420777);
  assert.equal(PORTALDOT_CHAIN_SPECS.decimals, 14);
  assert.equal(PORTALDOT_CHAIN_SPECS.tokenSymbol, 'tPOTv3');
});
