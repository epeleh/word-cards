import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';

describe('App.vue', () => {
  let wrapper;
  afterEach(() => wrapper?.unmount());

  beforeEach(() => {
    wrapper = shallowMount(App, {
      global: { stubs: ['router-view'] },
    });
  });

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
