import Mocked = jest.Mocked;
import { stypRenderGlobals } from './globals.render';
import { StypRender } from './render';
import { StyleProducer } from './style-producer';

describe('stypRenderGlobals', () => {

  let sheet: Mocked<CSSStyleSheet>;
  let producer: Mocked<StyleProducer>;

  beforeEach(() => {
    sheet = {
      insertRule: jest.fn((rule: string, index: string) => {
        return index;
      }),
    } as any;
    producer = {
      styleSheet: sheet,
      render: jest.fn(),
    } as any;
  });

  let render: StypRender.Function;

  beforeEach(() => {

    const renderDesc = stypRenderGlobals as StypRender.Descriptor;

    render = renderDesc.render.bind(renderDesc);
  });

  it('renders default namespace', () => {
    render(producer, { '@namespace': 'http://www.w3.org/1999/xhtml' });
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace url(http://www.w3.org/1999/xhtml);', 0);
  });
  it('renders namespace prefix', () => {
    render(producer, { '@namespace:svg': 'http://www.w3.org/2000/svg' });
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace svg url(http://www.w3.org/2000/svg);', 0);
  });
  it('renders multiple namespaces', () => {
    render(producer, {
      '@namespace:svg': 'http://www.w3.org/2000/svg',
      '@namespace:math': 'http://www.w3.org/1998/Math/MathML',
    });
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace svg url(http://www.w3.org/2000/svg);', 0);
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace math url(http://www.w3.org/1998/Math/MathML);', 1);
  });
  it('renders namespaces after imports', () => {
    render(producer, {
      '@namespace:math': 'http://www.w3.org/1998/Math/MathML',
      '@import:some.css': '',
      '@namespace:svg': 'http://www.w3.org/2000/svg',
    });
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace math url(http://www.w3.org/1998/Math/MathML);', 0);
    expect(sheet.insertRule).toHaveBeenCalledWith('@import url(some.css);', 0);
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace svg url(http://www.w3.org/2000/svg);', 2);
  });
});