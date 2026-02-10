import c1 from '@/app/lib/bible_rvr/1-chronicles.json';
import co1 from '@/app/lib/bible_rvr/1-corinthians.json';
import jn1 from '@/app/lib/bible_rvr/1-john.json';
import k1 from '@/app/lib/bible_rvr/1-kings.json';
import pe1 from '@/app/lib/bible_rvr/1-peter.json';
import sa1 from '@/app/lib/bible_rvr/1-samuel.json';
import th1 from '@/app/lib/bible_rvr/1-thessalonians.json';
import ti1 from '@/app/lib/bible_rvr/1-timothy.json';
import c2 from '@/app/lib/bible_rvr/2-chronicles.json';
import co2 from '@/app/lib/bible_rvr/2-corinthians.json';
import jn2 from '@/app/lib/bible_rvr/2-john.json';
import k2 from '@/app/lib/bible_rvr/2-kings.json';
import pe2 from '@/app/lib/bible_rvr/2-peter.json';
import sa2 from '@/app/lib/bible_rvr/2-samuel.json';
import th2 from '@/app/lib/bible_rvr/2-thessalonians.json';
import ti2 from '@/app/lib/bible_rvr/2-timothy.json';
import jn3 from '@/app/lib/bible_rvr/3-john.json';
import act from '@/app/lib/bible_rvr/act.json';
import am from '@/app/lib/bible_rvr/am.json';
import col from '@/app/lib/bible_rvr/colossians.json';
import dn from '@/app/lib/bible_rvr/dn.json';
import dt from '@/app/lib/bible_rvr/dt.json';
import ec from '@/app/lib/bible_rvr/ec.json';
import eph from '@/app/lib/bible_rvr/eph.json';
import et from '@/app/lib/bible_rvr/et.json';
import ex from '@/app/lib/bible_rvr/ex.json';
import ez from '@/app/lib/bible_rvr/ez.json';
import ezr from '@/app/lib/bible_rvr/ezr.json';
import gl from '@/app/lib/bible_rvr/gl.json';
import gn from '@/app/lib/bible_rvr/gn.json';
import hb from '@/app/lib/bible_rvr/hb.json';
import hg from '@/app/lib/bible_rvr/hg.json';
import hk from '@/app/lib/bible_rvr/hk.json';
import ho from '@/app/lib/bible_rvr/ho.json';
import is from '@/app/lib/bible_rvr/is.json';
import jd from '@/app/lib/bible_rvr/jd.json';
import jl from '@/app/lib/bible_rvr/jl.json';
import jm from '@/app/lib/bible_rvr/jm.json';
import jn from '@/app/lib/bible_rvr/jn.json';
import jo from '@/app/lib/bible_rvr/jo.json';
import job from '@/app/lib/bible_rvr/job.json';
import jr from '@/app/lib/bible_rvr/jr.json';
import js from '@/app/lib/bible_rvr/js.json';
import jud from '@/app/lib/bible_rvr/jud.json';
import lk from '@/app/lib/bible_rvr/lk.json';
import lm from '@/app/lib/bible_rvr/lm.json';
import lv from '@/app/lib/bible_rvr/lv.json';
import mi from '@/app/lib/bible_rvr/mi.json';
import mk from '@/app/lib/bible_rvr/mk.json';
import ml from '@/app/lib/bible_rvr/ml.json';
import mt from '@/app/lib/bible_rvr/mt.json';
import na from '@/app/lib/bible_rvr/na.json';
import ne from '@/app/lib/bible_rvr/ne.json';
import nm from '@/app/lib/bible_rvr/nm.json';
import ob from '@/app/lib/bible_rvr/ob.json';
import ph from '@/app/lib/bible_rvr/ph.json';
import phm from '@/app/lib/bible_rvr/phm.json';
import prv from '@/app/lib/bible_rvr/prv.json';
import ps from '@/app/lib/bible_rvr/ps.json';
import re from '@/app/lib/bible_rvr/re.json';
import rm from '@/app/lib/bible_rvr/rm.json';
import rt from '@/app/lib/bible_rvr/rt.json';
import so from '@/app/lib/bible_rvr/so.json';
import tt from '@/app/lib/bible_rvr/tt.json';
import zc from '@/app/lib/bible_rvr/zc.json';
import zp from '@/app/lib/bible_rvr/zp.json';

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
