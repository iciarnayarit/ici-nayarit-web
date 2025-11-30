import gn from '@/app/[locale]/lib/bible_rvr/gn.json';
import ex from '@/app/[locale]/lib/bible_rvr/ex.json';
import lv from '@/app/[locale]/lib/bible_rvr/lv.json';
import nm from '@/app/[locale]/lib/bible_rvr/nm.json';
import dt from '@/app/[locale]/lib/bible_rvr/dt.json';
import js from '@/app/[locale]/lib/bible_rvr/js.json';
import jud from '@/app/[locale]/lib/bible_rvr/jud.json';
import rt from '@/app/[locale]/lib/bible_rvr/rt.json';
import sa1 from '@/app/[locale]/lib/bible_rvr/1-samuel.json';
import sa2 from '@/app/[locale]/lib/bible_rvr/2-samuel.json';
import k1 from '@/app/[locale]/lib/bible_rvr/1-kings.json';
import k2 from '@/app/[locale]/lib/bible_rvr/2-kings.json';
import c1 from '@/app/[locale]/lib/bible_rvr/1-chronicles.json';
import c2 from '@/app/[locale]/lib/bible_rvr/2-chronicles.json';
import ezr from '@/app/[locale]/lib/bible_rvr/ezr.json';
import ne from '@/app/[locale]/lib/bible_rvr/ne.json';
import et from '@/app/[locale]/lib/bible_rvr/et.json';
import job from '@/app/[locale]/lib/bible_rvr/job.json';
import ps from '@/app/[locale]/lib/bible_rvr/ps.json';
import prv from '@/app/[locale]/lib/bible_rvr/prv.json';
import ec from '@/app/[locale]/lib/bible_rvr/ec.json';
import so from '@/app/[locale]/lib/bible_rvr/so.json';
import is from '@/app/[locale]/lib/bible_rvr/is.json';
import jr from '@/app/[locale]/lib/bible_rvr/jr.json';
import lm from '@/app/[locale]/lib/bible_rvr/lm.json';
import ez from '@/app/[locale]/lib/bible_rvr/ez.json';
import dn from '@/app/[locale]/lib/bible_rvr/dn.json';
import ho from '@/app/[locale]/lib/bible_rvr/ho.json';
import jl from '@/app/[locale]/lib/bible_rvr/jl.json';
import am from '@/app/[locale]/lib/bible_rvr/am.json';
import ob from '@/app/[locale]/lib/bible_rvr/ob.json';
import jn from '@/app/[locale]/lib/bible_rvr/jn.json';
import mi from '@/app/[locale]/lib/bible_rvr/mi.json';
import na from '@/app/[locale]/lib/bible_rvr/na.json';
import hk from '@/app/[locale]/lib/bible_rvr/hk.json';
import zp from '@/app/[locale]/lib/bible_rvr/zp.json';
import hg from '@/app/[locale]/lib/bible_rvr/hg.json';
import zc from '@/app/[locale]/lib/bible_rvr/zc.json';
import ml from '@/app/[locale]/lib/bible_rvr/ml.json';
import mt from '@/app/[locale]/lib/bible_rvr/mt.json';
import mk from '@/app/[locale]/lib/bible_rvr/mk.json';
import lk from '@/app/[locale]/lib/bible_rvr/lk.json';
import jo from '@/app/[locale]/lib/bible_rvr/jo.json';
import act from '@/app/[locale]/lib/bible_rvr/act.json';
import rm from '@/app/[locale]/lib/bible_rvr/rm.json';
import co1 from '@/app/[locale]/lib/bible_rvr/1-corinthians.json';
import co2 from '@/app/[locale]/lib/bible_rvr/2-corinthians.json';
import gl from '@/app/[locale]/lib/bible_rvr/gl.json';
import eph from '@/app/[locale]/lib/bible_rvr/eph.json';
import ph from '@/app/[locale]/lib/bible_rvr/ph.json';
import col from '@/app/[locale]/lib/bible_rvr/colossians.json';
import th1 from '@/app/[locale]/lib/bible_rvr/1-thessalonians.json';
import th2 from '@/app/[locale]/lib/bible_rvr/2-thessalonians.json';
import ti1 from '@/app/[locale]/lib/bible_rvr/1-timothy.json';
import ti2 from '@/app/[locale]/lib/bible_rvr/2-timothy.json';
import tt from '@/app/[locale]/lib/bible_rvr/tt.json';
import phm from '@/app/[locale]/lib/bible_rvr/phm.json';
import hb from '@/app/[locale]/lib/bible_rvr/hb.json';
import jm from '@/app/[locale]/lib/bible_rvr/jm.json';
import pe1 from '@/app/[locale]/lib/bible_rvr/1-peter.json';
import pe2 from '@/app/[locale]/lib/bible_rvr/2-peter.json';
import jn1 from '@/app/[locale]/lib/bible_rvr/1-john.json';
import jn2 from '@/app/[locale]/lib/bible_rvr/2-john.json';
import jn3 from '@/app/[locale]/lib/bible_rvr/3-john.json';
import jd from '@/app/[locale]/lib/bible_rvr/jd.json';
import re from '@/app/[locale]/lib/bible_rvr/re.json';

export const bibleData: { [key: string]: any } = {
    'génesis': gn, 'éxodo': ex, 'levítico': lv, 'números': nm, 'deuteronomio': dt, 'josué': js, 'jueces': jud, 'rut': rt,
    '1 samuel': sa1, '2 samuel': sa2, '1 reyes': k1, '2 reyes': k2, '1 crónicas': c1, '2 crónicas': c2, 'esdras': ezr,
    'nehemías': ne, 'ester': et, 'job': job, 'salmos': ps, 'proverbios': prv, 'eclesiastés': ec, 'cantar de los cantares': so,
    'isaías': is, 'jeremías': jr, 'lamentaciones': lm, 'ezequiel': ez, 'daniel': dn, 'oseas': ho, 'joel': jl,
    'amós': am, 'abdías': ob, 'jonás': jn, 'miqueas': mi, 'nahúm': na, 'habacuc': hk, 'sofonías': zp, 'hageo': hg,
    'zacarías': zc, 'malaquías': ml, 'mateo': mt, 'marcos': mk, 'lucas': lk, 'juan': jo, 'hechos': act, 'romanos': rm,
    '1 corintios': co1, '2 corintios': co2, 'gálatas': gl, 'efesios': eph, 'filipenses': ph, 'colosenses': col,
    '1 tesalonicenses': th1, '2 tesalonicenses': th2, '1 timoteo': ti1, '2 timoteo': ti2, 'tito': tt, 'filemón': phm,
    'hebreos': hb, 'santiago': jm, '1 pedro': pe1, '2 pedro': pe2, '1 juan': jn1, '2 juan': jn2, '3 juan': jn3,
    'judas': jd, 'apocalipsis': re,
};

export const bookOrder = [
    'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios', 'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías',
    'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito', 'Filemón', 'Hebreos', 'Santiago', '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis'
];

export const chaptersInBook = (bookName: string) => bibleData[bookName.toLowerCase()]?.chapters?.length || 0;
